import { ForbiddenException, HttpException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthDto, CreateUserDto } from './dto';
import { JwtPayload, Tokens } from './types';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';
import { Token } from 'src/schemas/Token.schema';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private userModel: Model<User>,
    @InjectModel(Token.name) private tokenModel: Model<Token>,
    private jwtService: JwtService,
    private config: ConfigService,
  ) {}

  async signup(dto: CreateUserDto): Promise<{ message: string }> {
    const hash = await bcrypt.hash(dto.password, 10);
    const newUser = new this.userModel({
      name: dto.name,
      email: dto.email,
      password: hash,
    });
    const isValid = await newUser.save();
    if (!isValid) return null;

    return { message: 'User created successfully.' };
  }

  async signin(dto: AuthDto): Promise<Tokens & { message: string }> {
    const user = await this.userModel.findOne({ email: dto.email });
    if (!user) throw new ForbiddenException('Access Denied');

    const passwordMatches = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.getTokens(user._id.toString(), user.email);
    await this.updateRefreshToken(user._id.toString(), tokens.refresh_token);
    return { ...tokens, message: 'Logged in successfully.' };
  }

  async logout(
    userId: string,
    refresh_token: string,
  ): Promise<{ message: string }> {
    const token = await this.tokenModel.findOne({ userId });
    if (!token) throw new ForbiddenException('Access Denied');
    const index = token.tokens.indexOf(refresh_token);
    if (index == -1) {
      throw new ForbiddenException('Access Denied');
    }
    token.tokens.splice(index, 1);
    const isValid = await token.save();
    if (!isValid) throw new HttpException('Server error', 500);
    return { message: 'Logged out successfully.' };
  }

  async refreshTokens(
    userId: string,
    email: string,
    refresh_token: string,
  ): Promise<Tokens & { message: string }> {
    const token = await this.tokenModel.findOne({ userId });
    const index = token.tokens.indexOf(refresh_token);
    if (index == -1) {
      throw new ForbiddenException('Access Denied');
    }
    const tokens = await this.getTokens(userId, email);
    await this.updateRefreshToken(userId, tokens.refresh_token);
    await this.logout(userId, refresh_token);

    return { ...tokens, message: 'Session updated successfully.' };
  }

  async updateRefreshToken(
    userId: string,
    refresh_token: string,
  ): Promise<void> {
    const token = await this.tokenModel.findOne({ userId });
    if (!token) {
      const newToken = new this.tokenModel({ userId, tokens: [refresh_token] });
      const isValid = await newToken.save();
      if (!isValid) throw new HttpException('Server error', 500);
    } else {
      token.tokens.push(refresh_token);
      const isValid = await token.save();
      if (!isValid) throw new HttpException('Server error', 500);
    }
  }

  async getTokens(userId: string, email: string): Promise<Tokens> {
    const jwtPayload: JwtPayload = {
      sub: userId,
      email: email,
    };

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('ACCESS_TOKEN_SECRET'),
        expiresIn: '15m',
      }),
      this.jwtService.signAsync(jwtPayload, {
        secret: this.config.get<string>('REFRESH_TOKEN_SECRET'),
        expiresIn: '7d',
      }),
    ]);

    return {
      access_token,
      refresh_token,
    };
  }
}

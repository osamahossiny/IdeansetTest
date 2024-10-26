import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Model } from 'mongoose';
import { User } from 'src/schemas/User.schema';

@ValidatorConstraint({ name: 'email', async: true })
@Injectable()
export class EmailExistValidator implements ValidatorConstraintInterface {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async validate(email: string): Promise<boolean> {
    try {
      const isEmailExist = await this.userModel.findOne({ email });
      if (isEmailExist) return false;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  defaultMessage(): string {
    return 'Email already exists';
  }
}

export const IsUserExist = (validationOptions?: ValidationOptions) => {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: EmailExistValidator,
    });
  };
};

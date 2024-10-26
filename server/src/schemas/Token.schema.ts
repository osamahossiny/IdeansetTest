import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';

@Schema()
export class Token {
  @Prop({ required: true, ref: 'User' })
  userId: mongoose.Schema.Types.ObjectId;
  @Prop({ required: true })
  tokens: [string];
}

export const TokenSchema = SchemaFactory.createForClass(Token);

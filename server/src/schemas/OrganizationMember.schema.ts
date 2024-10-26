import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class OrganizationMember {
  @Prop({ required: true })
  name: string;
  @Prop({ required: true })
  email: string;
  @Prop({ required: true, default: 'read-only' })
  access_level: string;
}

export const OrganizationMemberSchema =
  SchemaFactory.createForClass(OrganizationMember);

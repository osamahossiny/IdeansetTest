import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import {
  OrganizationMember,
  OrganizationMemberSchema,
} from './OrganizationMember.schema';

@Schema()
export class Organization {
  @Prop({ unique: true, required: true })
  name: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true, type: [OrganizationMemberSchema] })
  organization_members: [OrganizationMember];
}

export const OrganizationSchema = SchemaFactory.createForClass(Organization);

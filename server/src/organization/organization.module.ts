import { Module } from '@nestjs/common';
import { OrganizationController } from './organization.controller';
import { OrganizationService } from './organization.service';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Organization,
  OrganizationSchema,
} from 'src/schemas/Organization.schema';
import { NameExistValidator } from './validators/name.validator';
import { OwnerValidator } from './validators/owner.validator';
import { User, UserSchema } from 'src/schemas/User.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Organization.name,
        schema: OrganizationSchema,
      },
    ]),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),
  ],
  controllers: [OrganizationController],
  providers: [OrganizationService, NameExistValidator, OwnerValidator],
  exports: [OwnerValidator],
})
export class OrganizationModule {}

import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';
import { Model } from 'mongoose';
import { Organization } from 'src/schemas/Organization.schema';

@ValidatorConstraint({ name: 'name', async: true })
@Injectable()
export class NameExistValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
  ) {}

  async validate(name: string): Promise<boolean> {
    try {
      const isNameExist = await this.organizationModel.findOne({ name });
      if (isNameExist) return false;
      return true;
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  defaultMessage(): string {
    return 'Organization already exists';
  }
}

export const IsOrganizationExist = (validationOptions?: ValidationOptions) => {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: NameExistValidator,
    });
  };
};

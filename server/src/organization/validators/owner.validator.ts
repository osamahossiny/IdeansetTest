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
export class OwnerValidator implements ValidatorConstraintInterface {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    // @Inject(REQUEST) private readonly request: Request,
  ) {}

  async validate(name: string): Promise<boolean> {
    try {
      // console.log(this.request.user);
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

export const IsOrganizationOwner = (validationOptions?: ValidationOptions) => {
  return (object: unknown, propertyName: string) => {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: OwnerValidator,
    });
  };
};

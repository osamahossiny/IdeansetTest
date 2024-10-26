import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Organization } from 'src/schemas/Organization.schema';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
import { User } from 'src/schemas/User.schema';

@Injectable()
export class OrganizationService {
  constructor(
    @InjectModel(Organization.name)
    private organizationModel: Model<Organization>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async createOrganization(
    userName: string,
    userEmail: string,
    createOrganizationDto: CreateOrganizationDto,
  ): Promise<{ organization_id: string }> {
    const organizationData = new this.organizationModel({
      ...createOrganizationDto,
      organization_members: [
        {
          name: userName,
          email: userEmail,
          access_level: 'read_write',
        },
      ],
    });
    const newOrganization = await organizationData.save();
    if (!newOrganization) throw new HttpException('Server error', 500);
    return { organization_id: newOrganization._id.toString() };
  }
  async findAllOrganizations() {
    const organizations = await this.organizationModel.find({});
    const mappedOrganizations = organizations.map((org) => ({
      organization_id: org._id,
      name: org.name,
      description: org.description,
      organization_members: org.organization_members.map((mem) => ({
        name: mem.name,
        email: mem.email,
        access_level: mem.access_level,
      })),
    }));
    return mappedOrganizations;
  }
  async findOrganization(organization_id: string) {
    if (!mongoose.Types.ObjectId.isValid(organization_id)) {
      throw new HttpException('Invalid organization id.', 404);
    }
    const organization = await this.organizationModel.findById(organization_id);
    if (!organization) throw new HttpException('Invalid organization id.', 404);
    return {
      organization_id: organization._id,
      name: organization.name,
      description: organization.description,
      organization_members: organization.organization_members.map((mem) => ({
        name: mem.name,
        email: mem.email,
        access_level: mem.access_level,
      })),
    };
  }
  async updateOrganization(
    userName: string,
    userEmail: string,
    updateOrganizationDto: UpdateOrganizationDto,
    organization_id: string,
  ) {
    const organization = await this.validateOwnership(
      userName,
      userEmail,
      organization_id,
    );
    const checkDublicate = await this.organizationModel.findOne({
      name: updateOrganizationDto.name,
    });
    if (checkDublicate && checkDublicate._id.toString() != organization_id) {
      throw new HttpException('This organization name is not available.', 401);
    }
    organization.name = updateOrganizationDto.name;
    organization.description = updateOrganizationDto.description;
    const updated = await organization.save();
    if (!updated) throw new HttpException('Server error', 500);

    return {
      organization_id: organization._id,
      name: organization.name,
      description: organization.description,
    };
  }
  async deleteOrganization(
    userName: string,
    userEmail: string,
    organization_id: string,
  ): Promise<{ message: string }> {
    await this.validateOwnership(userName, userEmail, organization_id);

    const deleted = await this.organizationModel.deleteOne({
      _id: organization_id,
    });
    if (deleted.deletedCount !== 1) {
      throw new HttpException('Failed to delete.', 404);
    }
    return { message: 'Organization deleted successfully.' };
  }
  async inviteToOrganization(
    userName: string,
    userEmail: string,
    organization_id: string,
    invite_email: string,
  ): Promise<{ message: string }> {
    const organization = await this.validateOwnership(
      userName,
      userEmail,
      organization_id,
    );

    const isInvited = organization.organization_members.find(
      (mem) => mem.email == invite_email,
    );

    if (isInvited) throw new HttpException('User is already invited.', 401);

    const invitedUser = await this.userModel.findOne({ email: invite_email });

    if (!invitedUser)
      throw new HttpException('A user with this email does not exist.', 401);

    organization.organization_members.push({
      name: invitedUser.name,
      email: invitedUser.email,
      access_level: 'read_only',
    });

    const invited = organization.save();
    if (!invited) throw new HttpException('Server error', 500);
    return { message: 'User invited successfully.' };
  }

  async validateOwnership(
    userName: string,
    userEmail: string,
    organization_id: string,
  ) {
    if (!mongoose.Types.ObjectId.isValid(organization_id)) {
      throw new HttpException('Invalid organization id.', 404);
    }
    const organization = await this.organizationModel.findById(organization_id);
    if (!organization) throw new HttpException('Invalid organization id.', 404);
    const isOwner = organization.organization_members.find(
      (mem) => mem.name == userName && mem.email == userEmail,
    );
    if (!isOwner) throw new HttpException('Access denied.', 401);

    return organization;
  }
}

import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
  UseGuards,
} from '@nestjs/common';
import { CreateOrganizationDto, UpdateOrganizationDto } from './dto';
import { OrganizationService } from './organization.service';
import { AtGuard } from 'src/common/guards';
import { GetCurrentUser, GetCurrentUserId } from 'src/common/decorators';

@Controller('organization')
export class OrganizationController {
  constructor(private organizationService: OrganizationService) {}

  @Post('')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  createOrganization(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('email') email: string,
    @Body() dto: CreateOrganizationDto,
  ): Promise<{ organization_id: string }> {
    return this.organizationService.createOrganization(userId, email, dto);
  }

  @Put(':organization_id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  updateOrganization(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('email') email: string,
    @Body() dto: UpdateOrganizationDto,
    @Param('organization_id') organization_id: string,
  ) {
    return this.organizationService.updateOrganization(
      userId,
      email,
      dto,
      organization_id,
    );
  }
  @Delete(':organization_id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  deleteOrganization(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('email') email: string,
    @Param('organization_id') organization_id: string,
  ): Promise<{ message: string }> {
    return this.organizationService.deleteOrganization(
      userId,
      email,
      organization_id,
    );
  }
  @Post(':organization_id/invite')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  inviteToOrganization(
    @GetCurrentUserId() userId: string,
    @GetCurrentUser('email') email: string,
    @Param('organization_id') organization_id: string,
    @Body() { user_email }: { user_email: string },
  ): Promise<{ message: string }> {
    return this.organizationService.inviteToOrganization(
      userId,
      email,
      organization_id,
      user_email,
    );
  }

  @Get('')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  findAllOrganizations() {
    return this.organizationService.findAllOrganizations();
  }
  @Get(':organization_id')
  @HttpCode(HttpStatus.CREATED)
  @UseGuards(AtGuard)
  findOrganization(@Param('organization_id') organization_id: string) {
    return this.organizationService.findOrganization(organization_id);
  }
}

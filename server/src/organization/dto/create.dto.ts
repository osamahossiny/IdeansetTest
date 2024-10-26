import { IsNotEmpty, IsString } from 'class-validator';
import { IsOrganizationExist } from '../validators/name.validator';

export class CreateOrganizationDto {
  @IsNotEmpty()
  @IsString()
  @IsOrganizationExist()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;
}

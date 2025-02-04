import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ExternalRessourceType, ExternalSourceValueType } from '../../enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExternalRessourceDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  link: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsEnum(ExternalRessourceType)
  type: ExternalRessourceType;
}

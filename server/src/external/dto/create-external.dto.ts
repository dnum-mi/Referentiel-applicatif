import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { ExternalSourceType, ExternalSourceValueType } from '../../enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExternalDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  externalSourceId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  shortName: string;

  @ApiProperty()
  @IsDateString()
  @IsNotEmpty()
  lastSourceUpdate: string;

}

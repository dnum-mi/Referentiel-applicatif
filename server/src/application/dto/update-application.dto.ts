// src/application/dto/update-application.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateLifecycleDto, CreateActeurDto, CreateComplianceDto } from './create-application.dto';

export class UpdateApplicationDto extends PartialType(CreateApplicationDto) {
  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => CreateLifecycleDto)
  lifecycle?: CreateLifecycleDto;

  @IsOptional()
  @IsString()
  metadataId?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActeurDto)
  acteurs?: CreateActeurDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComplianceDto)
  compliances?: CreateComplianceDto[];
}

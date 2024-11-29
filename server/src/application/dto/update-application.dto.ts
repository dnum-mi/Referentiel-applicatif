// src/application/dto/update-application.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateApplicationDto } from './create-application.dto';
import { IsOptional, IsString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import {
  CreateLifecycleDto,
  CreateActorDto,
  CreateComplianceDto,
} from './create-application.dto';

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

  @IsString()
  uri: string;

  @IsString()
  url: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActorDto)
  actors?: CreateActorDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComplianceDto)
  compliances?: CreateComplianceDto[];
}

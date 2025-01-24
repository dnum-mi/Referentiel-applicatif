import { CreateExternalDto } from '../../external/dto/create-external.dto';
import { PartialType, PickType } from '@nestjs/mapped-types';
import {
  IsString,
  IsOptional,
  IsArray,
  IsEnum,
  IsDateString,
  ValidateNested,
  IsEmail,
  IsNotEmpty,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ComplianceStatus, ComplianceType, LifecycleStatus } from '../../enum';

export class CreateActorDto {
  @ApiProperty({
    example: 'admin',
    description: 'Role of the actor in the application',
  })
  @IsString()
  @IsOptional()
  role: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: 'user123', description: 'ID of the user' })
  @IsString()
  @IsOptional()
  userId: string;

  @ApiProperty({
    example: 'orgSource123',
    description: 'ID of the organization source',
    required: false,
  })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({
    example: 'app789',
    description: 'ID of the associated application',
    required: false,
  })
  @IsOptional()
  @IsString()
  applicationId?: string;
}

export class UpdateActorUserDto {
  @IsOptional()
  @IsString()
  userId: string;

  @IsOptional()
  @IsString()
  email?: string;
}

export class UpdateActorDto {
  @IsOptional()
  id?: string;

  @IsOptional()
  @IsString()
  role?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateActorUserDto)
  user?: UpdateActorUserDto;
}

export class CreateComplianceDto {
  @ApiProperty({
    enum: ComplianceType,
    description: 'Type of compliance (e.g., regulation, policy)',
  })
  @IsEnum(ComplianceType)
  @IsOptional()
  type: ComplianceType;

  @ApiProperty({ example: 'GDPR', description: 'Name of the compliance' })
  @IsString()
  @IsOptional()
  name: string | null;

  @ApiProperty({
    enum: ComplianceStatus,
    description: 'Compliance status (e.g., compliant, non_compliant)',
  })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  status: ComplianceStatus;

  @ApiProperty({
    example: '2023-01-01',
    description: 'Start date of validity',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  validityStart?: string | null;

  @ApiProperty({
    example: '2025-01-01',
    description: 'End date of validity',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  validityEnd?: string | null;

  @ApiProperty({
    example: '85',
    description: 'Score value (if applicable)',
    required: false,
  })
  @IsOptional()
  @IsString()
  scoreValue?: string | null;

  @ApiProperty({
    example: '%',
    description: 'Score unit (if applicable)',
    required: false,
  })
  @IsOptional()
  @IsString()
  scoreUnit?: string | null;

  @ApiProperty({
    example: 'Notes about the compliance',
    description: 'Additional notes',
    required: false,
  })
  @IsOptional()
  @IsString()
  notes?: string | null;
}

export class UpdateComplianceDto {
  @ApiProperty({
    description: 'ID de la compliance (uniquement pour les existantes)',
    required: false,
  })
  @IsOptional()
  id?: string;

  @ApiProperty({ enum: ComplianceType, required: false })
  @IsOptional()
  @IsEnum(ComplianceType)
  type?: ComplianceType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  name?: string | null;

  @ApiProperty({ enum: ComplianceStatus, required: false })
  @IsOptional()
  @IsEnum(ComplianceStatus)
  status?: ComplianceStatus;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  validityStart?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  validityEnd?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  scoreValue?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  scoreUnit?: string | null;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string | null;
}
export class CreateLifecycleDto {
  @ApiProperty({
    enum: LifecycleStatus,
    description: 'Status of the lifecycle (e.g., in_production)',
  })
  @IsEnum(LifecycleStatus)
  @IsOptional()
  status: LifecycleStatus;

  @ApiProperty({
    example: '2023-11-22',
    description: 'First production date (ISO 8601)',
  })
  @IsDateString()
  @IsOptional()
  firstProductionDate?: string;

  @ApiProperty({
    example: '2025-12-31',
    description: 'Planned decommissioning date (ISO 8601)',
    required: false,
  })
  @IsOptional()
  @IsDateString()
  plannedDecommissioningDate?: string;

  @ApiProperty({
    example: 'metadata123',
    description: 'Associated metadata ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  metadataId?: string;
}

export class CreateApplicationDto {
  @ApiProperty({
    example: 'My Application',
    description: 'Label of the application',
  })
  @IsString()
  label: string;

  @ApiProperty({
    example: 'metadata456',
    description: 'Metadata ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  metadataId?: string;

  @ApiProperty({
    example: 'short-app-name',
    description: 'Short name of the application',
    required: false,
  })
  @IsOptional()
  @IsString()
  shortName: string;

  @ApiProperty({
    example: 'http://example.com/logo.png',
    description: 'Logo URL of the application',
    required: false,
  })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({
    example: 'An amazing application',
    description: 'Description of the application',
  })
  @IsString()
  description: string;

  @ApiProperty({
    type: [String],
    example: ['finance', 'HR'],
    description: 'Purposes of the application',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  purposes?: string[];

  @ApiProperty({
    type: [String],
    example: ['tag1', 'tag2'],
    description: 'Tags associated with the application',
    required: false,
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({
    example: 'parentApp123',
    description: 'Parent application ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ type: CreateLifecycleDto })
  @ValidateNested()
  @Type(() => CreateLifecycleDto)
  lifecycle: CreateLifecycleDto = {
    status: LifecycleStatus.UNDER_CONSTRUCTION,
    firstProductionDate: new Date().toISOString(),
  };

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActorDto)
  actors: CreateActorDto[];

  @ApiProperty({ type: [CreateComplianceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComplianceDto)
  compliances: CreateComplianceDto[] = [];

  @ApiProperty({
    type: [CreateExternalDto],
    description: 'External references associated with the application',
    required: false,
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExternalDto)
  externals: CreateExternalDto[] = [];
}

export class PatchApplicationDto extends PickType(
  PartialType(CreateApplicationDto),
  [
    'label',
    'shortName',
    'description',
    'purposes',
    'tags',
    'parentId',
    'lifecycle',
  ] as const,
) {
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateComplianceDto)
  compliances?: UpdateComplianceDto[];

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => UpdateActorDto)
  actors?: UpdateActorDto[];
}

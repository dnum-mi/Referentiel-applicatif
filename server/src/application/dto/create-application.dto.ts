import { CreateExternalDto } from './../../external/dto/create-external.dto';
import { 
  IsString, 
  IsOptional, 
  IsArray, 
  IsEnum, 
  IsDateString, 
  ValidateNested, 
  ArrayMinSize, 
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { ComplianceStatus, ComplianceType, LifecycleStatus} from '../../enum';

export class CreateActorDto {
  @ApiProperty({ example: 'admin', description: 'Role of the actor in the application' })
  @IsString()
  role: string;

  @ApiProperty({ example: 'user123', description: 'ID of the user' })
  @IsString()
  userId: string;

  @ApiProperty({ example: 'orgSource123', description: 'ID of the organization source', required: false })
  @IsOptional()
  @IsString()
  organizationId?: string;

  @ApiProperty({ example: 'app789', description: 'ID of the associated application', required: false })
  @IsOptional()
  @IsString()
  applicationId?: string;
}

export class CreateComplianceDto {
  @ApiProperty({ enum: ComplianceType, description: 'Type of compliance (e.g., regulation, policy)' })
  @IsEnum(ComplianceType)
  type: ComplianceType;

  @ApiProperty({ example: 'GDPR', description: 'Name of the compliance' })
  @IsString()
  name: string;

  @ApiProperty({ enum: ComplianceStatus, description: 'Compliance status (e.g., compliant, non_compliant)' })
  @IsEnum(ComplianceStatus)
  status: ComplianceStatus;

  @ApiProperty({ example: '2023-01-01', description: 'Start date of validity', required: false })
  @IsOptional()
  @IsDateString()
  validityStart?: string;

  @ApiProperty({ example: '2025-01-01', description: 'End date of validity', required: false })
  @IsOptional()
  @IsDateString()
  validityEnd?: string;

  @ApiProperty({ example: '85', description: 'Score value (if applicable)', required: false })
  @IsOptional()
  @IsString()
  scoreValue?: string;

  @ApiProperty({ example: '%', description: 'Score unit (if applicable)', required: false })
  @IsOptional()
  @IsString()
  scoreUnit?: string;

  @ApiProperty({ example: 'Notes about the compliance', description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CreateLifecycleDto {
  @ApiProperty({ enum: LifecycleStatus, description: 'Status of the lifecycle (e.g., in_production)' })
  @IsEnum(LifecycleStatus)
  status: LifecycleStatus;

  @ApiProperty({ example: '2023-11-22', description: 'First production date (ISO 8601)' })
  @IsDateString()
  firstProductionDate: string;

  @ApiProperty({ example: '2025-12-31', description: 'Planned decommissioning date (ISO 8601)', required: false })
  @IsOptional()
  @IsDateString()
  plannedDecommissioningDate?: string;

  @ApiProperty({ example: 'metadata123', description: 'Associated metadata ID', required: false })
  @IsOptional()
  @IsString()
  metadataId?: string;
}

export class CreateApplicationDto {
  @ApiProperty({ example: 'My Application', description: 'Label of the application' })
  @IsString()
  label: string;

  @ApiProperty({ example: 'metadata456', description: 'Metadata ID', required: false })
  @IsOptional()
  @IsString()
  metadataId?: string;

  @ApiProperty({ example: 'short-app-name', description: 'Short name of the application', required: false })
  @IsOptional()
  @IsString()
  shortName?: string;

  @ApiProperty({ example: 'http://example.com/logo.png', description: 'Logo URL of the application', required: false })
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiProperty({ example: 'An amazing application', description: 'Description of the application' })
  @IsString()
  description: string;

  @ApiProperty({ type: [String], example: ['finance', 'HR'], description: 'Purposes of the application', required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  purposes?: string[];

  @ApiProperty({ type: [String], example: ['tag1', 'tag2'], description: 'Tags associated with the application', required: false })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'http://example.com/app', description: 'URI of the application', required: false })
  @IsOptional()
  @IsString()
  uri?: string;

  @ApiProperty({ example: 'http://example.com/dashboard', description: 'URL of the application', required: false })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiProperty({ example: 'parentApp123', description: 'Parent application ID', required: false })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiProperty({ type: CreateLifecycleDto })
  @ValidateNested()
  @Type(() => CreateLifecycleDto)
  lifecycle: CreateLifecycleDto;

  @ApiProperty({ type: [CreateActorDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateActorDto)
  @ArrayMinSize(1)
  actors: CreateActorDto[];

  @ApiProperty({ type: [CreateComplianceDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateComplianceDto)
  compliances: CreateComplianceDto[];

  @ApiProperty({ type: [CreateExternalDto], description: 'External references associated with the application', required: false })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateExternalDto)
  externals: CreateExternalDto[];
}



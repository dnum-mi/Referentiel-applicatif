import { 
    IsString, 
    IsOptional, 
    IsArray, 
    IsEnum, 
    IsDateString, 
    ValidateNested, 
    ArrayMinSize 
  } from 'class-validator';
  import { Type } from 'class-transformer';
  import { LifecycleStatus, ComplianceType, ComplianceStatus } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
  
  export class CreateActeurDto {
    @ApiProperty()
    @IsString()
    role: string;
    
    @ApiProperty()
    @IsString()
    userId: string;
  
    @ApiProperty()
    @IsOptional()
    @IsString()
    organizationId?: string;
  
    @ApiProperty()
    @IsOptional()
    @IsString()
    applicationId?: string;
  }
  
  export class CreateComplianceDto {
    @ApiProperty()
    @IsEnum(ComplianceType)
    type: ComplianceType;
  
    @ApiProperty()
    @IsString()
    name: string;
  
    @ApiProperty()
    @IsEnum(ComplianceStatus)
    status: ComplianceStatus;
  
    @ApiProperty()
    @IsOptional()
    @IsDateString()
    validityStart?: string;
  
    @ApiProperty()
    @IsOptional()
    @IsDateString()
    validityEnd?: string;
  
    @ApiProperty()
    @IsOptional()
    @IsString()
    scoreValue?: string;
  
    @ApiProperty()
    @IsOptional()
    @IsString()
    scoreUnit?: string;
  
    @ApiProperty()
    @IsOptional()
    @IsString()
    notes?: string;
  }
  
  export class CreateLifecycleDto {
    @ApiProperty()
    @IsEnum(LifecycleStatus)
    status: LifecycleStatus;
   
    @ApiProperty()
    @IsDateString()
    firstProductionDate: string;
  
    @ApiProperty()
    @IsOptional()
    @IsDateString()
    plannedDecommissioningDate?: string;
  
    @ApiProperty()
    @IsString()
    metadataId: string;
  }
  
  export class CreateApplicationDto {
    @ApiProperty()
    @IsString()
    label: string;
  
    @ApiProperty()
    @IsString()
    shortname: string;
  
    @ApiProperty()
    @IsString()
    logo: string;
  
    @ApiProperty()
    @IsString()
    description: string;
  
    @ApiProperty()
    @IsString()
    url: string;
  
    @ApiProperty()
    @IsString()
    uri: string;
  
    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    purposes: string[];
  
    @ApiProperty()
    @IsArray()
    @IsString({ each: true })
    tags: string[];
  
    @ApiProperty()
    @IsOptional()
    @IsString()
    parentId?: string;
  
    @ApiProperty()
    @ValidateNested()
    @Type(() => CreateLifecycleDto)
    lifecycle: CreateLifecycleDto;
  
    @ApiProperty()
    @IsString()
    metadataId: string;
  
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateActeurDto)
    @ArrayMinSize(1)
    acteurs: CreateActeurDto[]; // Anciennement 'roles'
  
    @ApiProperty()
    @IsArray()
    @ValidateNested({ each: true })
    @Type(() => CreateComplianceDto)
    compliances: CreateComplianceDto[];
  }
  
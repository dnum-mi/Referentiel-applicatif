import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ComplianceType } from '../../enums/compliancetype.enum';
import { ComplianceStatus } from '../../enums/compliancestatus.enum'; // Importer les énumérations

export class CreateComplianceDto {
  @ApiProperty({ description: 'Le type de conformité', enum: ComplianceType })
  @IsEnum(ComplianceType)
  type: ComplianceType;

  @ApiProperty({ description: 'Le nom de la conformité' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'Le statut de la conformité',
    enum: ComplianceStatus,
  })
  @IsEnum(ComplianceStatus)
  status: ComplianceStatus;

  @ApiProperty({ description: 'Date de début de validité', required: false })
  @IsOptional()
  @IsString()
  validityStart?: string; // Date au format ISO

  @ApiProperty({ description: 'Date de fin de validité', required: false })
  @IsOptional()
  @IsString()
  validityEnd?: string; // Date au format ISO
}

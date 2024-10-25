import { IsNotEmpty, IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateRoleDto {
  @ApiProperty({ description: 'Le type de rôle (admin, user, etc.)' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: "ID de l'utilisateur associé à ce rôle" })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: "ID de l'organisation associée à ce rôle",
    required: false,
  })
  @IsOptional()
  @IsString()
  organizationId?: string; // Facultatif

  @ApiProperty({
    description: "ID de l'application associée à ce rôle",
    required: false,
  })
  @IsOptional()
  @IsString()
  applicationId?: string; // Facultatif
}

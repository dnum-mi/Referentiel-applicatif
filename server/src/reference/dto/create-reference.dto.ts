import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReferenceDto {
  @ApiProperty({ description: 'ID du dépôt associé' })
  @IsString()
  @IsNotEmpty()
  repositoryId: string;

  @ApiProperty({ description: 'La valeur de la référence' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ description: 'Le label de la référence' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'Le nom court de la référence' })
  @IsString()
  @IsNotEmpty()
  shortName: string;

  @ApiProperty({ description: 'La date de dernière mise à jour' })
  @IsString()
  @IsNotEmpty()
  lastUpdateDate: string;

  @ApiProperty({ description: 'La date de dernière mise à jour' })
  @IsString()
  metadataId: string;
}

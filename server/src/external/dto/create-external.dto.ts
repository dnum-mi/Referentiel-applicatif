import { IsString, IsNotEmpty, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExternalDto {
  @ApiProperty({ example: 'source123', description: 'ID of the external source' })
  @IsString()
  @IsNotEmpty()
  externalSourceId: string;

  @ApiProperty({ example: 'value123', description: 'Value associated with the external source' })
  @IsString()
  @IsNotEmpty()
  value: string;

  @ApiProperty({ example: 'External Label', description: 'Label of the external reference' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ example: 'ext-short', description: 'Short name of the external reference' })
  @IsString()
  @IsNotEmpty()
  shortName: string;

  @ApiProperty({ example: '2023-11-22T10:00:00Z', description: 'Last source update date in ISO 8601 format' })
  @IsDateString()
  @IsNotEmpty()
  lastSourceUpdate: string;
}

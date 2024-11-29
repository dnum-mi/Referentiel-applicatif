import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ExternalSourceType, ExternalSourceValueType } from '../../enum';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExternalSourceDto {
  @ApiProperty()
  @IsEnum(ExternalSourceType)
  type: ExternalSourceType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  uri: string;

  @ApiProperty()
  @IsEnum(ExternalSourceValueType)
  valueType: ExternalSourceValueType;

}

import { IsOptional, IsString } from 'class-validator';

export class SearchApplicationDto {
  @IsOptional()
  @IsString()
  label?: string;
}

// src/applications/dto/search-application.dto.ts
import { IsOptional, IsString, IsInt, Min } from 'class-validator';

export class SearchApplicationDto {
  @IsOptional()
  @IsString()
  label?: string;
}

import { PartialType } from '@nestjs/swagger';
import { CreateExternalSourceDto } from './create-external-source.dto';

export class UpdateExternalSourceDto extends PartialType(
  CreateExternalSourceDto,
) {}

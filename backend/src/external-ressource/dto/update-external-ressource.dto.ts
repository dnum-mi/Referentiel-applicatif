import { PartialType } from '@nestjs/swagger';
import { CreateExternalRessourceDto } from './create-external-ressource.dto';

export class UpdateExternalSourceDto extends PartialType(
  CreateExternalRessourceDto,
) {}

import { Controller, Post, Body, Request } from '@nestjs/common';
import { ExternalSourceService } from './external-source.service';
import { CreateExternalSourceDto } from './dto/create-external-source.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('external-sources')
@Controller('external-sources')
export class ExternalSourceController {
  constructor(private readonly externalSourceService: ExternalSourceService) {}

  @Post()
  @ApiOperation({ summary: 'Créer un nouvel enregistrement dans la table ExternalSource avec metadata' })
  @ApiResponse({ status: 201, description: 'ExternalSource créé avec succès.' })
  @ApiResponse({ status: 400, description: 'Paramètres incorrects.' })
  async createExternalSource(
    @Body() createExternalSourceDto: CreateExternalSourceDto,
    @Request() req
  ) {
    const ownerId = 'f15d1c13-8198-4ca5-a180-94656e20d568';
    return this.externalSourceService.createExternalSource(createExternalSourceDto, ownerId);
  }
}

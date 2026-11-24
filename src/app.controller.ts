import {
  Controller,
  Get,
  Redirect,
  ServiceUnavailableException,
} from '@nestjs/common'
import { AppService, zHealth } from './app.service'
import { createZodDto, ZodResponse } from 'nestjs-zod'
import { ApiExcludeEndpoint } from '@nestjs/swagger'

class HealthDto extends createZodDto(zHealth) {}

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiExcludeEndpoint()
  @Get()
  @Redirect('/swagger')
  index() {}

  @Get('health')
  @ZodResponse({ type: HealthDto })
  async health() {
    const health = await this.appService.health()
    if (health.status === 'DOWN') throw new ServiceUnavailableException(health)
    return health
  }
}

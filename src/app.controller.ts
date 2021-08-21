import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiTags, ApiOkResponse } from '@nestjs/swagger';

@ApiTags('Ping')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOkResponse({description: 'The service is up and running'})
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}

import {Controller, Get, Redirect} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ApiExcludeController} from '@nestjs/swagger';

@ApiExcludeController()
@Controller()
export class AppController {
  constructor(private configService: ConfigService) {}

  @Get()
  @Redirect()
  handleRoot() {
    const redirectUrl =
      this.configService.get<string>('ENABLE_SWAGGER') === 'true'
        ? '/api/swagger'
        : '/api/docs';
    return {url: redirectUrl, statusCode: 302};
  }
}

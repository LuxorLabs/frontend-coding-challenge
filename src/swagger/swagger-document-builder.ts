import {INestApplication} from '@nestjs/common';
import {DocumentBuilder, SwaggerModule} from '@nestjs/swagger';
import {_SWAGGER_TAGS} from './swagger-tags/swagger-tags.constants';
import {SwaggerUI} from './swagger-ui.class';
// import * as packageJson from '../../package.json';
import * as express from 'express';
import {serveReDoc} from '../redoc/redoc-config';

export class SwaggerDocumentBuilder {
  private readonly expressApp: express.Application;

  constructor(private readonly app: INestApplication) {
    this.expressApp = this.app.getHttpAdapter().getInstance();
  }

  public setupSwagger() {
    this.initializeReDoc();
    if (this.isSwaggerEnabled()) {
      this.initializeSwagger();
    } else {
      console.log('Swagger documentation is disabled');
    }
  }

  private buildConfig() {
    const apiDescription =
      'Luxor Bidding.\n\n' +
      'For further assistance, please contact Luxor Bidding support.';

    const docBuilder = new DocumentBuilder()
      .setTitle('Luxor Bidding Documentation')
      .setDescription(apiDescription)
      .setVersion('1.0')
      .addBearerAuth();

    _SWAGGER_TAGS.forEach((tag) => {
      docBuilder.addTag(tag.name, tag.description);
    });

    return docBuilder.build();
  }

  private createDocument() {
    const config = this.buildConfig();
    return SwaggerModule.createDocument(this.app, config);
  }

  private isSwaggerEnabled(): boolean {
    return (process.env.ENABLE_SWAGGER ?? 'false') === 'true';
  }

  private initializeSwagger() {
    const document = this.createDocument();
    const swaggerUI = new SwaggerUI(_SWAGGER_TAGS);
    SwaggerModule.setup(
      'api/swagger',
      this.app,
      document,
      swaggerUI.customOptions,
    );
  }

  private initializeReDoc() {
    const document = this.createDocument();
    this.setupReDocRoutes(document);
  }

  private setupReDocRoutes(document: any) {
    // Serve the Swagger JSON for ReDoc
    this.expressApp.use('/api-json', (req: any, res: any) =>
      res.json(document),
    );
    // Serve ReDoc with the Swagger JSON
    this.expressApp.get('/api/docs', serveReDoc);
  }
}

import {SWAGGER_UI_CONSTANTS} from './constants/swagger-ui.constants';
import {SwaggerTag} from './swagger-tags/swagger-tags.interface';

export class SwaggerUI {
  constructor(private readonly tags: SwaggerTag[]) {}

  private customSiteTitle = 'Luxor Bidding Documentation';
  private faviconFilename = 'favicon.png';
  private topbarIconFilename = 'app-logo.svg';

  private customfavIcon: string = `../api/public/${this.faviconFilename}`;

  private generateCustomCss(): string {
    let css = '';
    const parents = new Set(
      this.tags.filter((tag) => tag.parent === '').map((tag) => tag.name),
    );

    parents.forEach((parent) => {
      const formattedParent = parent.replace(/ /g, '%20');
      css += `.nostyle[href="#/${formattedParent}"] span { font-size: 24px; }\n`;
      css += `.nostyle[href="#/${formattedParent}"] ~ .expand-operation { display: none; }\n`;
    });

    return css;
  }

  private customCss: string = `
    .topbar-wrapper { content:url('../api/public/${this.topbarIconFilename}'); width:242px; height:auto; }
    .topbar-wrapper svg { visibility: hidden; }
    .swagger-ui .topbar { background-color: ${SWAGGER_UI_CONSTANTS.TOPBAR.BACKGROUND_COLOR}; }
    .swagger-ui .opblock.opblock-get { background-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.GET.BACKGROUND_COLOR}; border-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.GET.BORDER_COLOR}; }
    .swagger-ui .opblock.opblock-get .opblock-summary-method { background: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.GET.SUMMARY_COLOR}; }
    .swagger-ui .opblock.opblock-post { background-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.POST.BACKGROUND_COLOR}; border-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.POST.BORDER_COLOR}; }
    .swagger-ui .opblock.opblock-post .opblock-summary-method { background: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.POST.SUMMARY_COLOR}; }
    .swagger-ui .opblock.opblock-delete { background-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.DELETE.BACKGROUND_COLOR}; border-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.DELETE.BORDER_COLOR}; }
    .swagger-ui .opblock.opblock-delete .opblock-summary-method { background: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.DELETE.SUMMARY_COLOR}; }
    .swagger-ui .opblock.opblock-patch { background-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.PATCH.BACKGROUND_COLOR}; border-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.PATCH.BORDER_COLOR}; }
    .swagger-ui .opblock.opblock-patch .opblock-summary-method { background: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.PATCH.SUMMARY_COLOR}; }
    .swagger-ui .opblock.opblock-put { background-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.PUT.BACKGROUND_COLOR}; border-color: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.PUT.BORDER_COLOR}; }
    .swagger-ui .opblock.opblock-put .opblock-summary-method { background: ${SWAGGER_UI_CONSTANTS.HTTP_METHODS.PUT.SUMMARY_COLOR}; }
    .swagger-ui .btn.authorize { border-color: ${SWAGGER_UI_CONSTANTS.AUTHORIZE.BACKGROUND_COLOR}; color: ${SWAGGER_UI_CONSTANTS.AUTHORIZE.BACKGROUND_COLOR}; }
    .swagger-ui .btn.authorize svg { fill: ${SWAGGER_UI_CONSTANTS.AUTHORIZE.BACKGROUND_COLOR}; }

    .swagger-ui .tag-group {
      margin-bottom: 10px;
    }
    .swagger-ui .tag-group > .tag-group {
      padding-left: 20px;
    }
    .swagger-ui .tag {
      cursor: pointer;
    }
    .swagger-ui .info .title small.version-stamp {
      background-color: #E96F4C;
    }
    .swagger-ui .info h2 { color: #175cd3 !important; }
    .swagger-ui .info .title { color: #050080; }
    .swagger-ui .info .title small { background: #175cd3; }
    .swagger-ui .opblock-tag { color: #050080; font-size: 19px; }
    .swagger-ui .topbar .topbar-wrapper { height: 80px;}

    ${this.generateCustomCss()}
  `;

  private swaggerOptions = {
    persistAuthorization: true,
  };

  public customOptions = {
    customfavIcon: this.customfavIcon,
    customSiteTitle: this.customSiteTitle,
    customCss: this.customCss,
    swaggerOptions: this.swaggerOptions,
  };
}

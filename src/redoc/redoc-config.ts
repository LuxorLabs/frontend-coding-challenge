import {_SWAGGER_TAGS} from '../swagger';
import {Request, Response} from 'express';

export const serveReDoc = (req: Request, res: Response) => {
  const dynamicStyles = _SWAGGER_TAGS
    .map((tag) => {
      const id = `tag\\/` + tag.name.replace(/\s+/g, '-');
      const h2Style =
        tag.parent === ''
          ? `div#${id} h2 { font-weight: 700 !important; font-size: 2.67143em !important; }`
          : `div#${id} h2 { padding-bottom: 0px !important; font-size: 2em !important; font-weight: 400 !important; }`;

      const divStyle =
        tag.parent === ''
          ? `div#${id} { padding: 40px 0px 0px 0px !important; }`
          : `div#${id} { padding-top: 20px !important; padding-bottom: 0px !important; }`;

      return `${h2Style}\n${divStyle}`;
    })
    .join('\n');

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Luxor Bidding Documentation</title>
        <link rel="icon" href="../api/public/favicon.png" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Montserrat:300,400,700|Roboto:300,400,700">
        <style>
          .navbar {
            height: 100px;
            background-color: #0265E2;
            display: flex;
            align-items: center;
            padding-left: 20px;
          }
          .navbar img {
            height: 60px;
          }
          .sc-bpUBKd.brGIkq:not(:has(svg)) {
            font-weight: bold !important;
            font-size: 1em !important;
          }       
          .sc-bpUBKd.jUVzae.-depth1.active:not(:has(svg)) {
            font-weight: bold !important;
            font-size: 1em !important;
          }
          .sc-jXbUNg.copjkU {
            font-weight: 10 !important;
          }
          h1.sc-imWYAI.sc-fTFjTM.dCEJze.hRziAa
          {
            font-weight: 700 !important;
            font-size: 2.67143em !important;
          }
          ${dynamicStyles}
        </style>
      </head>
      <body style="margin: 0px;">
        <div class="navbar">
          <img src="../api/public/app-logo.svg" alt="Logo" style="height: 50px;">
        </div>
        <redoc spec-url='/api-json'></redoc>
        <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
      </body>
    </html>
  `;

  res.send(html);
};

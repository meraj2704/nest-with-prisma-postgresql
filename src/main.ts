// Must stay first: modules below read process.env while they load
import 'dotenv/config';
import { RequestMethod, ValidationPipe } from '@nestjs/common';
import type { CustomOrigin } from '@nestjs/common/interfaces/external/cors-options.interface.js';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmetImport, { type HelmetOptions } from 'helmet';
import { WinstonModule } from 'nest-winston';
import { AppModule } from './app.module.js';
import { isAllowedOrigin } from './common/config/cors-origins.js';
import { AllExceptionsFilter } from './common/filters/http-exception.filter.js';
import { TransformInterceptor } from './common/interceptors/transform.interceptor.js';
import { loggerConfig } from './core/logger/winston.config.js';

const GLOBAL_PREFIX = 'api/v1';

// Vercel's build type-checks imports with CommonJS resolution, where helmet's typings make the
// default import the module object instead of the function. Node always loads helmet's ESM
// build at runtime, so the default import is the function; the cast keeps both checkers happy.
const helmet = helmetImport as unknown as (
  options?: Readonly<HelmetOptions>,
) => (req: unknown, res: unknown, next: (err?: unknown) => void) => void;

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(loggerConfig),
  });

  const configService = app.get(ConfigService);
  const isDev = configService.get('NODE_ENV') !== 'production';

  app.setGlobalPrefix(GLOBAL_PREFIX, {
    exclude: [{ path: '/', method: RequestMethod.GET }],
  });

  // Behind a reverse proxy every request appears to come from the proxy, which would put every
  // client in one rate-limit bucket. Set TRUST_PROXY_HOPS to the number of proxies in front of
  // the app. Leave it unset when exposed directly: trusting a proxy that isn't there lets anyone
  // forge their IP with an X-Forwarded-For header. Vercel overwrites X-Forwarded-For with the
  // real client IP, so one hop is trusted there by default.
  const trustProxyHops = Number(
    configService.get('TRUST_PROXY_HOPS') || (process.env.VERCEL ? 1 : 0),
  );
  if (trustProxyHops > 0) {
    app.getHttpAdapter().getInstance().set('trust proxy', trustProxyHops);
  }

  const corsOrigin: CustomOrigin = (origin, callback) => {
    if (isAllowedOrigin(origin, isDev)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  };

  app.enableCors({
    origin: corsOrigin,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
  });

  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: false,
    }),
  );
  app.use(compression());

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  app.useGlobalFilters(new AllExceptionsFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  if (isDev) {
    const config = new DocumentBuilder()
      .setTitle('Team Task Management API')
      .setDescription(
        'Departments, projects, modules, tasks and work-session time tracking',
      )
      .setVersion('1.0')
      .addTag('Base', 'Health check')
      .addTag('Authentication', 'Login, token refresh and password change')
      .addTag('Users', 'User management and team endpoints')
      .addTag('Projects', 'Project endpoints')
      .addTag('Module', 'Project module endpoints')
      .addTag('Tasks', 'Task and work-session endpoints')
      .addTag('Dashboard', 'Role-based dashboard endpoints')
      .addBearerAuth(
        {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          name: 'JWT',
          description: 'Enter JWT token',
          in: 'header',
        },
        'JWT-auth',
      )
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  const port = configService.get('PORT') || 4001;
  await app.listen(port, '0.0.0.0');
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();

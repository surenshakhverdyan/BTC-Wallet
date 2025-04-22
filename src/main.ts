import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get<ConfigService>(ConfigService);
  app.enableCors({ origin: configService.get<string>('CORS_ORIGIN') });
  app.useGlobalPipes(new ValidationPipe());
  app.setGlobalPrefix('api');

  const config = new DocumentBuilder()
    .setTitle('Bitcoin Wallet API')
    .setDescription('API documentation for Bitcoin Wallet application')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('wallet', 'Bitcoin wallet management')
    .addTag('bitcoin', 'Bitcoin transaction operations')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  await app.listen(configService.get<number>('PORT') ?? 3000);
}
void bootstrap();

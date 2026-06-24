import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: '*', // In production, replace this with the client UI URL
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Enable Helmet for HTTP security headers
  app.use(helmet());

  // Rate Limiting security: 1000 requests per 15 minutes window
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, 
      max: 1000, 
      message: { message: 'Too many requests from this IP, please try again later.', statusCode: 429 },
    }),
  );

  // Global validation pipeline for DTO request bodies
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Clinitech Healthcare API')
    .setDescription('API documentation for the Clinitech Healthcare Dashboard backend system')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api-docs', app, document);

  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`NestJS application successfully running on: http://localhost:${port}`);
  console.log(`Swagger Documentation available at: http://localhost:${port}/api-docs`);
}
bootstrap();

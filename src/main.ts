import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { PrismaService } from './common/prisma.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get configuration service
  const configService = app.get(ConfigService);

  // Enable global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip properties that don't have decorators
      forbidNonWhitelisted: true, // Throw error if non-whitelisted properties exist
      transform: true, // Automatically transform payload to DTO instances
      transformOptions: {
        enableImplicitConversion: true, // Convert types automatically
      },
    }),
  );

  // Enable soft delete middleware
  const prismaService = app.get(PrismaService);
  prismaService.enableSoftDelete();

  // Set global API prefix
  app.setGlobalPrefix('api/v1');

  // Enable CORS if needed
  app.enableCors({
    origin: true, // Configure appropriately for production
    credentials: true,
  });

  // Get port from configuration
  const port = configService.get<number>('app.port') || 3000;

  await app.listen(port);
  console.log(`🚀 UMS Application running on: http://localhost:${port}`);
  console.log(`📚 API available at: http://localhost:${port}/api/v1`);
}

bootstrap();

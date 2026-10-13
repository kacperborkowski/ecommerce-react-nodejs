import { INestApplication, ValidationPipe } from '@nestjs/common';

// Shared between main.ts and e2e tests, so tests run the app with the same settings
export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

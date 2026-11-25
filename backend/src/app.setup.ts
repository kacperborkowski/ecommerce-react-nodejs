import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';

// Shared between main.ts and e2e tests, so tests run the app with the same settings
export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  // Reads the Cookie header into req.cookies (used for the guest cart id)
  app.use(cookieParser());
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

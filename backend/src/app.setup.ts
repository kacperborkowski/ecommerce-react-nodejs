import { INestApplication, ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import express from 'express';
import { fileURLToPath } from 'node:url';

// backend/public/images, both from src/ (tests) and from dist/ (built app)
const IMAGES_DIR = fileURLToPath(new URL('../public/images', import.meta.url));

// Shared between main.ts and e2e tests, so tests run the app with the same settings
export function setupApp(app: INestApplication): void {
  app.setGlobalPrefix('api');
  // Reads the Cookie header into req.cookies (used for the guest cart id)
  app.use(cookieParser());
  // Serves product images, e.g. GET /images/products/voltix-nova-12.svg.
  // Outside /api, because these are files, not API responses.
  // maxAge lets the browser keep an image for a day without asking again.
  app.use('/images', express.static(IMAGES_DIR, { maxAge: '1d' }));
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
}

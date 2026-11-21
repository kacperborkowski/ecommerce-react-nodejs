import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  // On Ctrl+C or a restart in watch mode, let Nest call onModuleDestroy
  // (e.g. close database connections) before the process exits.
  app.enableShutdownHooks();

  await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();

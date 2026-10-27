import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module.js';
import { setupApp } from './app.setup.js';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  setupApp(app);

  // Cloud Run stops containers with SIGTERM. Shutdown hooks let Nest call
  // onModuleDestroy (e.g. close database connections) before the process exits.
  app.enableShutdownHooks();

  // Cloud Run sets PORT. 0.0.0.0 accepts connections from outside the container.
  await app.listen(process.env.PORT ?? 3000, '0.0.0.0');
}
await bootstrap();

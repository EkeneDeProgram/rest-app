import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BodySizeMiddleware } from 'middleware/body-size.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Apply the BodySizeMiddleware
  app.use(new BodySizeMiddleware().use);
  await app.listen(3000);
}
bootstrap();

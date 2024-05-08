import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'https://project-management-react-js-z3gu.vercel.app', // Allow requests from this origin
    credentials: true, // Allow sending cookies from the frontend
  });

  await app.listen(process.env.PORT,'0.0.0.0');
}

bootstrap();

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const expressApp = express();

async function bootstrap() {
  const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
  app.enableCors({
    origin: '*',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true,
  });
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.init();
  return expressApp;
}

const appPromise = bootstrap();
export default async function handler(req: any, res: any) {
  const app = await appPromise;
  return (app as any)(req, res);
}

import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express'; // sigur pt TS fără esModuleInterop

const appPromise = (async () => {
  const expressApp = express();
  const nestApp = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));

  nestApp.enableCors({
    origin: '*',
    methods: ['GET','POST','PUT','DELETE','OPTIONS'],
    credentials: true,
  });

  nestApp.useGlobalPipes(new ValidationPipe({ transform: true }));
  await nestApp.init();
  return expressApp;
})();

export default async function handler(req: any, res: any) {
  const app = await appPromise;
  return (app as any)(req, res);
}

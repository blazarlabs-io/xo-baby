import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FirebaseService } from './firebase/firebase.service';

import { UserController } from './user/user.controller';
import { UserService } from './user/user.service';

import { KidController } from './kid/kid.controller';
import { KidService } from './kid/kid.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  controllers: [
    UserController,
    KidController, 
  ],
  providers: [
    FirebaseService,
    UserService,
    KidService, 
  ],
})
export class AppModule {}

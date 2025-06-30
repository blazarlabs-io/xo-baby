// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  controllers: [UserController],
  providers:   [UserService, FirebaseService],
  exports: [UserService]
})
export class UserModule {}

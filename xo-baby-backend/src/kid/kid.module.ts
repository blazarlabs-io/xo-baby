// src/kid/kid.module.ts
import { Module } from '@nestjs/common';
import { KidController } from './kid.controller';
import { KidService } from './kid.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserModule } from 'src/user/user.module';

@Module({
  imports: [UserModule],
  controllers: [KidController],
  providers:   [KidService, FirebaseService],
  exports:     [KidService],
})
export class KidModule {}

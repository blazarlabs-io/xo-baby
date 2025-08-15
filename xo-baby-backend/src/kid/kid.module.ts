// src/kid/kid.module.ts
import { Module } from '@nestjs/common';
import { KidController } from './kid.controller';
import { KidService } from './kid.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserModule } from 'src/user/user.module';
import { PinataService } from '../ipfs/pinata.service';
import { EncryptionService } from '../encryption/encryption.service';

@Module({
  imports: [UserModule],
  controllers: [KidController],
  providers: [KidService, FirebaseService, PinataService, EncryptionService],
  exports: [KidService],
})
export class KidModule {}

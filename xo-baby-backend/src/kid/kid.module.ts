// src/kid/kid.module.ts
import { Module } from '@nestjs/common';
import { KidController } from './kid.controller';
import { KidService } from './kid.service';
import { FirebaseService } from '../firebase/firebase.service';
import { UserModule } from '../user/user.module';
import { EncryptionModule } from '../encryption/encryption.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [UserModule, EncryptionModule, IpfsModule],
  controllers: [KidController],
  providers: [KidService, FirebaseService],
  exports: [KidService],
})
export class KidModule { }

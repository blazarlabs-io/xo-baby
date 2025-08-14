// src/user/user.module.ts
import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { FirebaseService } from '../firebase/firebase.service';
import { EncryptionModule } from '../encryption/encryption.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [EncryptionModule, IpfsModule],
  controllers: [UserController],
  providers: [UserService, FirebaseService],
  exports: [UserService],
})
export class UserModule {}

import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { IpfsModule } from '../ipfs/ipfs.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [IpfsModule, EncryptionModule],
  controllers: [TaskController],
  providers: [TaskService, FirebaseService, KidService, FirebaseAuthGuard],
})
export class TaskModule {}

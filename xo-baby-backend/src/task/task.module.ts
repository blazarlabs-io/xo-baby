import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { EncryptionModule } from '../encryption/encryption.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [EncryptionModule, IpfsModule],
  controllers: [TaskController],
  providers: [TaskService, FirebaseService, KidService, FirebaseAuthGuard],
})
export class TaskModule { }

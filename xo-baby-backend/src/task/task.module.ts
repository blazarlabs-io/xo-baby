import { Module } from '@nestjs/common';
import { TaskController } from './task.controller';
import { TaskService } from './task.service';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';

@Module({
  controllers: [TaskController],
  providers: [TaskService, FirebaseService, KidService, FirebaseAuthGuard],
})
export class TaskModule {}

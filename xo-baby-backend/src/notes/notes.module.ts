import { Module } from '@nestjs/common';
import { NotesController } from './notes.controller';
import { NotesService } from './notes.service';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';

@Module({
  controllers: [NotesController],
  providers: [NotesService, FirebaseService, KidService],
})
export class NotesModule {}
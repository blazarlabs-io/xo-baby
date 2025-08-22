import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { TaskModule } from './task/task.module';
import { KidModule } from './kid/kid.module';
import { UserModule } from './user/user.module';
import { NotesModule } from './notes/notes.module';
import { MeasurementsModule } from './measurements/measurements.module';
import { MedicalDataModule } from './medical-data/medical-data.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TaskModule,
    KidModule,
    UserModule,
    NotesModule,
    MeasurementsModule,
    MedicalDataModule,
  ],
})
export class AppModule {}

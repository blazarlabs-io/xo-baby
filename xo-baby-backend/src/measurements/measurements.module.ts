import { Module } from '@nestjs/common';
import { MeasurementsController } from './measurements.controller';
import { MeasurementsService } from './measurements.service';
import { FirebaseService } from '../firebase/firebase.service';

@Module({
  controllers: [MeasurementsController],
  providers: [MeasurementsService, FirebaseService],
})
export class MeasurementsModule {}

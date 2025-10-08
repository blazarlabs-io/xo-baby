import { Module } from '@nestjs/common';
import { DoctorDiagnosisController } from './doctor-diagnosis.controller';
import { DoctorDiagnosisService } from './doctor-diagnosis.service';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { EncryptionModule } from '../encryption/encryption.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [EncryptionModule, IpfsModule],
  controllers: [DoctorDiagnosisController],
  providers: [DoctorDiagnosisService, FirebaseService, KidService, FirebaseAuthGuard],
})
export class DoctorDiagnosisModule { }


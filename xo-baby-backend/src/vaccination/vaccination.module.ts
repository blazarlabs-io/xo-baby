import { Module } from '@nestjs/common';
import { VaccinationController } from './vaccination.controller';
import { VaccinationService } from './vaccination.service';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { EncryptionModule } from '../encryption/encryption.module';
import { IpfsModule } from '../ipfs/ipfs.module';

@Module({
  imports: [EncryptionModule, IpfsModule],
  controllers: [VaccinationController],
  providers: [VaccinationService, FirebaseService, KidService, FirebaseAuthGuard],
})
export class VaccinationModule { }


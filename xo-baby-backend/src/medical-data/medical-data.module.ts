import { Module } from '@nestjs/common';
import { MedicalDataController } from './medical-data.controller';
import { MedicalDataService } from './medical-data.service';
import { FirebaseService } from '../firebase/firebase.service';
import { IpfsModule } from '../ipfs/ipfs.module';
import { EncryptionModule } from '../encryption/encryption.module';

@Module({
  imports: [IpfsModule, EncryptionModule],
  controllers: [MedicalDataController],
  providers: [MedicalDataService, FirebaseService],
  exports: [MedicalDataService],
})
export class MedicalDataModule {}

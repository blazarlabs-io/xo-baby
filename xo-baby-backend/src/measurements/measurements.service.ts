import { Injectable } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { CreateMeasurementRecordDto } from './dto/create-measurement-record.dto';
import { MeasurementRecordDto } from './dto/measurement-record.dto';
import * as admin from 'firebase-admin';

@Injectable()
export class MeasurementsService {
  private db: admin.firestore.Firestore;

  constructor(private readonly firebase: FirebaseService) {
    this.db = this.firebase.getFirestore();
  }

  private async getCollection(type: 'weight' | 'height' | 'headCircumference') {
    const map = {
      weight: 'weightRecords',
      height: 'heightRecords',
      headCircumference: 'headCircumferenceRecords',
    } as const;
    return this.db.collection(map[type]);
  }

  async getRecords(
    kidId: string,
    type: 'weight' | 'height' | 'headCircumference',
  ): Promise<MeasurementRecordDto[]> {
    const col = await this.getCollection(type);
    const snap = await col.where('kidId', '==', kidId).get();

    // Sort by date on the client side to avoid compound index requirement
    const docs = snap.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    // Sort by date string (works for ISO date format YYYY-MM-DD)
    return docs.sort((a, b) => a.date.localeCompare(b.date));
  }

  async createRecord(
    kidId: string,
    dto: CreateMeasurementRecordDto,
    type: 'weight' | 'height' | 'headCircumference',
  ): Promise<MeasurementRecordDto> {
    const col = await this.getCollection(type);
    const data = { kidId, date: dto.date, value: dto.value };
    const ref = await col.add(data);
    const snap = await ref.get();
    return { id: ref.id, ...(snap.data() as any) };
  }
}

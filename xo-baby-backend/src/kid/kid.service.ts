
import { Injectable } from '@nestjs/common';
import { CreateKidDto } from './dto/create-kid.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class KidService {
  constructor(private readonly firebase: FirebaseService) {}

  async createKid(dto: CreateKidDto) {
    const docRef = this.firebase
      .getFirestore()
      .collection('kids')
      .doc(); 

    const kidData = {
      ...dto,
      createdAt: new Date().toISOString(),
    };

    await docRef.set(kidData);
    return { id: docRef.id, ...kidData };
  }
}

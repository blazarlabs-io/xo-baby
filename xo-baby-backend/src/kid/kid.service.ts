
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

  async getKidsByUserToken(token: string) {
    const decoded = await this.firebase.getAuth().verifyIdToken(token);
    const uid = decoded.uid;

    const snapshot = await this.firebase
      .getFirestore()
      .collection('kids')
      .where('parentId', '==', uid)
      .get();

    const kids = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    return kids;
  }

}

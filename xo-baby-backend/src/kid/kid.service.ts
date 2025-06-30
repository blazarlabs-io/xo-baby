import { Kid } from './kid.model';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateKidDto } from './dto/create-kid.dto';
import { FirebaseService } from '../firebase/firebase.service';
import * as admin from 'firebase-admin';

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

  async findById(kidId: string): Promise<Kid | null> {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() } as Kid;
  }

  async updateWeight(kidId: string, userId: string, weight: number, date: string) {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    if (kid.parentId !== userId) {
      throw new UnauthorizedException('You are not the parent of this kid');
    }

    await docRef.update({
      'vitals.weight': weight,
      weightHistory: admin.firestore.FieldValue.arrayUnion({
        value: weight,
        date,
      }),
    });

    return { success: true, weight, date };
  }

  async updateHeight(kidId: string, userId: string, height: number, date: string) {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    if (kid.parentId !== userId) {
      throw new UnauthorizedException('You are not the parent of this kid');
    }

    await docRef.update({
      'vitals.height': height,
      heightHistory: admin.firestore.FieldValue.arrayUnion({
        value: height,
        date,
      }),
    });

    return { success: true, height, date };
  }

  async getWeightHistory(kidId: string, userId: string) {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    if (kid.parentId !== userId) {
      throw new UnauthorizedException('You are not the parent of this kid');
    }

    const history = kid.weightHistory || [];
    return { kidId: kidId, weightHistory: history };
  }

  async getHeightHistory(kidId: string, userId: string) {
    const docRef = this.firebase.getFirestore().collection('kids').doc(kidId);
    const doc = await docRef.get();

    if (!doc.exists) throw new UnauthorizedException('Kid not found');

    const kid = doc.data() as Kid;
    if (kid.parentId !== userId) {
      throw new UnauthorizedException('You are not the parent of this kid');
    }

    const history = kid.heightHistory || [];
    return { kidId: kidId, heightHistory: history };
  }

}

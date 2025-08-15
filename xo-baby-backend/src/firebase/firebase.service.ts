import * as admin from 'firebase-admin';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class FirebaseService {
  private readonly firestore: FirebaseFirestore.Firestore;
  private readonly auth: admin.auth.Auth;

  constructor() {
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
      });
    }

    this.firestore = admin.firestore();
    this.auth = admin.auth();
  }

  getFirestore() {
    return this.firestore;
  }

  getAuth() {
    return this.auth;
  }

  async verifyIdToken(idToken: string) {
    try {
      const decoded = await this.auth.verifyIdToken(idToken);
      return decoded;
    } catch (err) {
      throw new UnauthorizedException('Invalid Firebase ID token');
    }
  }
}

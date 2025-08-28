import { Injectable, UnauthorizedException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class AuthService {
  constructor(private readonly firebaseService: FirebaseService) {}

  async refreshToken(uid: string) {
    try {
      // Use Firebase Admin SDK to create a fresh custom token
      const customToken = await this.firebaseService.getAuth().createCustomToken(uid);
      return { token: customToken };
    } catch (err) {
      throw new UnauthorizedException('Could not refresh token');
    }
  }
}

import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { FirebaseService } from '../firebase/firebase.service';

@Injectable()
export class UserService {
  constructor(private readonly firebase: FirebaseService) {}

  async createUser(dto: CreateUserDto) {
    // Create Firebase Auth user
    const userRecord = await this.firebase.getAuth().createUser({
      email: dto.email,
      password: dto.password,
    });

    // Save user profile in Firestore
    await this.firebase.getFirestore().collection('users').doc(userRecord.uid).set({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      uid: userRecord.uid,
      createdAt: new Date().toISOString(),
    });

    return { uid: userRecord.uid, email: dto.email };
  }
}

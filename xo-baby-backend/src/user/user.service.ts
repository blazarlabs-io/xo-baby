import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
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

    // Save user profile in Firestore with role
    await this.firebase.getFirestore().collection('users').doc(userRecord.uid).set({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email,
      uid: userRecord.uid,
      role: dto.role,
      createdAt: new Date().toISOString(),
    });

    return { uid: userRecord.uid, email: dto.email, role: dto.role };
  }

  async updateUserRole(uid: string, dto: UpdateRoleDto) {
    try {
      const userDoc = await this.firebase.getFirestore().collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        throw new NotFoundException('User not found');
      }

      await this.firebase.getFirestore().collection('users').doc(uid).update({
        role: dto.role,
        updatedAt: new Date().toISOString(),
      });

      return { uid, role: dto.role, message: 'Role updated successfully' };
    } catch (error) {
      throw new UnauthorizedException('Failed to update user role');
    }
  }

  async getUserProfile(uid: string) {
    try {
      const userDoc = await this.firebase.getFirestore().collection('users').doc(uid).get();
      
      if (!userDoc.exists) {
        throw new NotFoundException('User not found');
      }

      const userData = userDoc.data();
      if (!userData) {
        throw new NotFoundException('User data not found');
      }

      return {
        uid: userData.uid,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role || 'parent', // Default to parent if no role
        createdAt: userData.createdAt,
      };
    } catch (error) {
      throw new UnauthorizedException('Failed to get user profile');
    }
  }

  async getAllMedicalPersonnel() {
    try {
      const medicalSnapshot = await this.firebase
        .getFirestore()
        .collection('users')
        .where('role', '==', 'medical')
        .get();

      return medicalSnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      }));
    } catch (error) {
      throw new UnauthorizedException('Failed to get medical personnel');
    }
  }

  async loginUser(email: string, password: string) {
    try {
      const userCredential = await this.firebase
        .getAuth()
        .getUserByEmail(email); 
     
      return { uid: userCredential.uid, email: userCredential.email };
    } catch (error) {
      throw new UnauthorizedException('Invalid credentials');
    }
  }

  async verifyIdToken(idToken: string) {
    try {
      const decodedToken = await this.firebase.getAuth().verifyIdToken(idToken);
      
      // Get user profile to include role information
      const userProfile = await this.getUserProfile(decodedToken.uid);
      
      return userProfile;
    } catch (error) {
      throw new UnauthorizedException('Invalid ID token');
    }
  }
  
}
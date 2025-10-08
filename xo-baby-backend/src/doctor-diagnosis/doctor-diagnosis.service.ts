import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { CreateDoctorDiagnosisDto } from './dto/create-doctor-diagnosis.dto';
import { GetDoctorDiagnosisDto } from './dto/get-doctor-diagnosis.dto';
import { UpdateDoctorDiagnosisDto } from './dto/update-doctor-diagnosis.dto';

@Injectable()
export class DoctorDiagnosisService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly kidService: KidService,
  ) { }

  private async ensureAccess(kidId: string, userId: string) {
    console.log(`🔍 Doctor Diagnosis access check - kidId: ${kidId}, userId: ${userId}`);
    
    const kid = await this.kidService.findById(kidId);
    if (!kid) {
      console.log(`❌ Kid not found: ${kidId}`);
      throw new NotFoundException(`Kid with id ${kidId} not found`);
    }

    // Get user profile to determine role
    const userDoc = await this.firebaseService.getFirestore().collection('users').doc(userId).get();
    const userRole = userDoc.exists ? userDoc.data()?.role || 'parent' : 'parent';

    console.log(`👤 User role: ${userRole}, Kid parentId: ${kid.parentId}`);

    // Check access based on role and relationships
    const hasAccess = 
      userRole === 'admin' ||                    // Admin can access all kids
      kid.parentId === userId ||                 // Parent of the kid
      (kid as any).doctorId === userId ||        // Doctor assigned to the kid
      (kid as any).adminId === userId ||         // Admin assigned to the kid
      userRole === 'medical';                    // Medical personnel can access all kids

    console.log(`🔐 Access granted: ${hasAccess}`);

    if (!hasAccess) {
      console.log(`❌ Access denied for user ${userId} to kid ${kidId}`);
      throw new ForbiddenException("You don't have permission to access this child's doctor diagnosis records.");
    }

    return { kid, userRole };
  }

  async create(createDto: CreateDoctorDiagnosisDto, userId: string) {
    await this.ensureAccess(createDto.kidId, userId);

    const data = {
      ...createDto,
      createdAt: new Date().toISOString(),
    };
    const docRef = await this.firebaseService
      .getFirestore()
      .collection('doctorDiagnosis')
      .add(data);

    return { id: docRef.id, ...data };
  }

  async findAll(queryDto: GetDoctorDiagnosisDto, userId: string) {
    const { limit = 10, kidId } = queryDto;

    console.log('kidId', kidId);
    console.log('limit', limit);
    if (kidId) {
      await this.ensureAccess(kidId, userId);
    }

    let query = this.firebaseService
      .getFirestore()
      .collection('doctorDiagnosis')
      .limit(Number(limit));

    if (kidId) {
      query = query.where('kidId', '==', kidId) as any;
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async update(id: string, updateDto: UpdateDoctorDiagnosisDto, userId: string) {
    const docRef = this.firebaseService.getFirestore().collection('doctorDiagnosis').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new NotFoundException(`Doctor diagnosis record with id ${id} not found`);
    }

    const data = doc.data();
    if (!data) {
      throw new NotFoundException(`Doctor diagnosis record with id ${id} not found`);
    }
    await this.ensureAccess(data.kidId, userId);

    const updatedData = {
      ...updateDto,
      updatedAt: new Date().toISOString(),
    };
    
    await docRef.update(updatedData);
    return { id: doc.id, ...data, ...updatedData };
  }

  async delete(id: string, userId: string) {
    const docRef = this.firebaseService.getFirestore().collection('doctorDiagnosis').doc(id);
    const doc = await docRef.get();
    
    if (!doc.exists) {
      throw new NotFoundException(`Doctor diagnosis record with id ${id} not found`);
    }

    const data = doc.data();
    if (!data) {
      throw new NotFoundException(`Doctor diagnosis record with id ${id} not found`);
    }
    await this.ensureAccess(data.kidId, userId);

    await docRef.delete();
    return { success: true };
  }
}


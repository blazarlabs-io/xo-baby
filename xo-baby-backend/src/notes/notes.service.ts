import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { GetNotesDto } from './dto/get-notes.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Injectable()
export class NotesService {
  constructor(
    private readonly firebaseService: FirebaseService,
    private readonly kidService: KidService,
  ) { }

  private async ensureAccess(kidId: string, userId: string) {
    const kid = await this.kidService.findById(kidId);
    if (!kid) {
      throw new NotFoundException(`Kid with id ${kidId} not found`);
    }

    // Get user profile to determine role
    const userDoc = await this.firebaseService.getFirestore().collection('users').doc(userId).get();
    const userRole = userDoc.exists ? userDoc.data()?.role || 'parent' : 'parent';

    // Check access based on role and relationships
    const hasAccess = 
      userRole === 'admin' ||                    // Admin can access all kids
      kid.parentId === userId ||                 // Parent of the kid
      (kid as any).doctorId === userId ||        // Doctor assigned to the kid
      (kid as any).adminId === userId;           // Admin assigned to the kid

    if (!hasAccess) {
      throw new ForbiddenException("You don't have permission to access this child's notes.");
    }

    return { kid, userRole };
  }

  async create(dto: CreateNoteDto, userId: string) {
    await this.ensureAccess(dto.kidId, userId);
    const data = {
      ...dto,
      createdAt: new Date().toISOString(),
    };
    const docRef = await this.firebaseService
      .getFirestore()
      .collection('notes')
      .add(data);
    return { id: docRef.id, ...data };
  }

  async findAll(query: GetNotesDto, userId: string) {
    if (query.kidId) {
      await this.ensureAccess(query.kidId, userId);
    }
    const collection = this.firebaseService.getFirestore().collection('notes');
    let firestoreQuery: FirebaseFirestore.Query = collection;

    if (query.kidId) {
      firestoreQuery = firestoreQuery.where('kidId', '==', query.kidId);
    }
    if (query.category) {
      firestoreQuery = firestoreQuery.where('category', '==', query.category);
    }

    const snapshot = await firestoreQuery.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
  }

  async update(id: string, dto: UpdateNoteDto, userId: string) {
    const docRef = this.firebaseService.getFirestore().collection('notes').doc(id);
    const snap = await docRef.get();
    if (!snap.exists) {
      throw new NotFoundException(`Note with id ${id} not found`);
    }
    const note = snap.data() as any;
    await this.ensureAccess(note.kidId, userId);

    await docRef.update({ ...dto, updatedAt: new Date().toISOString() });
    const updated = await docRef.get();
    return { id: updated.id, ...(updated.data() as any) };
  }
}
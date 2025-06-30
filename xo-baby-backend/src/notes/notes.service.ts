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
  ) {}

  private async ensureOwnership(kidId: string, userId: string) {
    const kid = await this.kidService.findById(kidId);
    if (!kid || kid.parentId !== userId) {
      throw new ForbiddenException("You are not this child's parent.");
    }
  }

  async create(dto: CreateNoteDto, userId: string) {
    await this.ensureOwnership(dto.kidId, userId);
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
      await this.ensureOwnership(query.kidId, userId);
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
    await this.ensureOwnership(note.kidId, userId);

    await docRef.update({ ...dto, updatedAt: new Date().toISOString() });
    const updated = await docRef.get();
    return { id: updated.id, ...(updated.data() as any) };
  }
}
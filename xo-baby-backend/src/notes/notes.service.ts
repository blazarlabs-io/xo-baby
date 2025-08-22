import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { GetNotesDto } from './dto/get-notes.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import * as admin from 'firebase-admin';

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
    console.log(
      `🔐 Note creation - User ${userId} creating note for kid ${dto.kidId}`,
    );
    await this.ensureOwnership(dto.kidId, userId);

    const data = {
      ...dto,
      createdAt: new Date().toISOString(),
    };

    console.log(`📝 Note data to save:`, data);

    const docRef = await this.firebaseService
      .getFirestore()
      .collection('notes')
      .add(data);

    const result = { id: docRef.id, ...data };
    console.log(`✅ Note created successfully:`, result);
    return result;
  }

  async findAll(query: GetNotesDto, userId: string) {
    console.log(
      `🔐 Note retrieval - User ${userId} requesting notes with query:`,
      query,
    );

    if (query.kidId) {
      await this.ensureOwnership(query.kidId, userId);
    }

    const collection = this.firebaseService.getFirestore().collection('notes');
    let firestoreQuery: admin.firestore.Query = collection;

    if (query.kidId) {
      firestoreQuery = firestoreQuery.where('kidId', '==', query.kidId);
    }
    if (query.category) {
      firestoreQuery = firestoreQuery.where('category', '==', query.category);
    }

    const snapshot = await firestoreQuery.get();
    const notes = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as any),
    }));

    console.log(`📝 Found ${notes.length} notes for user ${userId}`);
    return notes;
  }

  async update(id: string, dto: UpdateNoteDto, userId: string) {
    const docRef = this.firebaseService
      .getFirestore()
      .collection('notes')
      .doc(id);
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

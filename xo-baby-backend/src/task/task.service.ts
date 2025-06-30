import { Injectable, ForbiddenException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';

@Injectable()
export class TaskService {
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

  async create(createTaskDto: CreateTaskDto, userId: string) {
    await this.ensureOwnership(createTaskDto.kidId, userId);

    const data = {
      ...createTaskDto,
      createdAt: new Date().toISOString(),
    };
    const docRef = await this.firebaseService
      .getFirestore()
      .collection('tasks')
      .add(data);

    return { id: docRef.id, ...data };
  }

  async findAll(queryDto: GetTasksDto, userId: string) {
    const { limit, kidId } = queryDto;
    if (kidId) {
      await this.ensureOwnership(kidId, userId);
    }

    let query = this.firebaseService
      .getFirestore()
      .collection('tasks')
      .orderBy('date', 'desc')
      .limit(limit);

    if (kidId) {
      query = query.where('kidId', '==', kidId);
    }

    const snapshot = await query.get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
}

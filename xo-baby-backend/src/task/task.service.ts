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
    console.log(`🔍 Checking ownership for kid ${kidId} and user ${userId}`);
    const kid = await this.kidService.findById(kidId);
    console.log(`🔍 Found kid:`, kid);
    if (!kid) {
      console.log(`❌ Kid not found with ID: ${kidId}`);
      throw new ForbiddenException('Child not found.');
    }
    if (kid.parentId !== userId) {
      console.log(
        `❌ Ownership mismatch: kid.parentId=${kid.parentId}, userId=${userId}`,
      );
      throw new ForbiddenException("You are not this child's parent.");
    }
    console.log(`✅ Ownership verified for kid ${kidId}`);
  }

  async create(createTaskDto: CreateTaskDto, uid: string) {
    await this.ensureOwnership(createTaskDto.kidId, uid);

    console.log(`Creating task for kid ${createTaskDto.kidId} by user ${uid}`);

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

  async findAll(queryDto: GetTasksDto, uid: string) {
    console.log(`Finding tasks for user ${uid}`);
    const { limit = 50, kidId } = queryDto;
    if (kidId) {
      await this.ensureOwnership(kidId, uid);
    }

    let query = this.firebaseService
      .getFirestore()
      .collection('tasks')
      .limit(limit);

    if (kidId) {
      console.log(`Filtering tasks for kid ${kidId}`);
      query = query.where('kidId', '==', kidId);
    }

    const snapshot = await query.get();
    const tasks = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    console.log(`📋 Found ${tasks.length} tasks for user ${uid}`);
    if (kidId) {
      console.log(
        `📋 Tasks for kid ${kidId}:`,
        tasks.map((t) => ({
          id: t.id,
          name: (t as any).name,
          date: (t as any).date,
          time: (t as any).time,
        })),
      );
    }

    // Sort in memory to avoid requiring a composite index
    const sortedTasks = tasks.sort((a, b) => {
      const dateA = (a as any).date;
      const dateB = (b as any).date;
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });

    console.log(`📋 Returning ${sortedTasks.length} sorted tasks`);
    return sortedTasks;
  }
}

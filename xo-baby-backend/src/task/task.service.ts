import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { FirebaseService } from '../firebase/firebase.service';
import { KidService } from '../kid/kid.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';

@Injectable()
export class TaskService {
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
      throw new ForbiddenException("You don't have permission to access this child's tasks.");
    }

    return { kid, userRole };
  }

  async create(createTaskDto: CreateTaskDto, userId: string) {
    await this.ensureAccess(createTaskDto.kidId, userId);

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

      console.log('kidId', kidId);
      console.log('limit', limit);
      if (kidId) {
        await this.ensureAccess(kidId, userId);
      }

      let query = this.firebaseService
        .getFirestore()
        .collection('tasks')
        // .orderBy('date', 'desc')
        .limit(limit);

      if (kidId) {
        query = query.where('kidId', '==', kidId);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // return [];
  }
}

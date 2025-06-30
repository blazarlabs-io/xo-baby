import { Controller, Post, Body, Get, Query, UseGuards, Req } from '@nestjs/common';
import { Request } from 'express';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { DecodedIdToken } from 'firebase-admin/lib/auth/token-verifier';

interface RequestWithUser extends Request {
  user: DecodedIdToken;
}

@UseGuards(FirebaseAuthGuard)
@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('create')
  async create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateTaskDto,
  ) {
    const userId = req.user.uid;
    return this.taskService.create(dto, userId);
  }

  @Get('get-all')
  async getAll(
    @Req() req: RequestWithUser,
    @Query() dto: GetTasksDto,
  ) {
    const userId = req.user.uid;
    return this.taskService.findAll(dto, userId);
  }
}

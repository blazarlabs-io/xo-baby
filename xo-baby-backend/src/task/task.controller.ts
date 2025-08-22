import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  UnauthorizedException,
} from '@nestjs/common';
import { TaskService } from './task.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTasksDto } from './dto/get-tasks.dto';

@Controller('task')
export class TaskController {
  constructor(private readonly taskService: TaskService) {}

  @Post('create')
  async create(@Body() dto: CreateTaskDto, @Query('uid') uid: string) {
    if (!uid) {
      throw new UnauthorizedException('User ID is required');
    }
    console.log('🔐 Task creation - User UID:', uid);
    return this.taskService.create(dto, uid);
  }

  @Get('get-all')
  async getAll(@Query() dto: GetTasksDto, @Query('uid') uid: string) {
    if (!uid) {
      throw new UnauthorizedException('User ID is required');
    }
    console.log('🔐 Task retrieval - User UID:', uid);
    return this.taskService.findAll(dto, uid);
  }
}

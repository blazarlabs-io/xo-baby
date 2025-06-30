import { Controller, Post, Body, Get, Query, Put, Param, Req, UseGuards } from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { GetNotesDto } from './dto/get-notes.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { FirebaseAuthGuard } from '../auth/auth.guard';
import { DecodedIdToken } from 'firebase-admin/auth';
import { Request } from 'express';

interface RequestWithUser extends Request {
  user: DecodedIdToken;
}

@UseGuards(FirebaseAuthGuard)
@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('create')
  create(
    @Req() req: RequestWithUser,
    @Body() dto: CreateNoteDto,
  ) {
    const userId = req.user.uid;
    return this.notesService.create(dto, userId);
  }

  @Get('get-all')
  findAll(
    @Req() req: RequestWithUser,
    @Query() query: GetNotesDto,
  ) {
    const userId = req.user.uid;
    return this.notesService.findAll(query, userId);
  }

  @Get('by-category/:category')
  findByCategory(
    @Req() req: RequestWithUser,
    @Param('category') category: string,
  ) {
    const userId = req.user.uid;
    return this.notesService.findAll({ category }, userId);
  }

  @Put('edit/:id')
  update(
    @Req() req: RequestWithUser,
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
  ) {
    const userId = req.user.uid;
    return this.notesService.update(id, dto, userId);
  }
}
import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Put,
  Param,
  UnauthorizedException,
} from '@nestjs/common';
import { NotesService } from './notes.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { GetNotesDto } from './dto/get-notes.dto';
import { UpdateNoteDto } from './dto/update-note.dto';

@Controller('notes')
export class NotesController {
  constructor(private readonly notesService: NotesService) {}

  @Post('create')
  create(@Body() dto: CreateNoteDto, @Query('uid') uid: string) {
    if (!uid) {
      throw new UnauthorizedException('User ID is required');
    }
    console.log('🔐 Note creation - User UID:', uid);
    return this.notesService.create(dto, uid);
  }

  @Get('get-all')
  findAll(@Query() query: GetNotesDto, @Query('uid') uid: string) {
    if (!uid) {
      throw new UnauthorizedException('User ID is required');
    }
    console.log('🔐 Note retrieval - User UID:', uid);
    return this.notesService.findAll(query, uid);
  }

  @Get('by-category/:category')
  findByCategory(
    @Param('category') category: string,
    @Query('uid') uid: string,
  ) {
    if (!uid) {
      throw new UnauthorizedException('User ID is required');
    }
    console.log('🔐 Note category retrieval - User UID:', uid);
    return this.notesService.findAll({ category }, uid);
  }

  @Put('edit/:id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateNoteDto,
    @Query('uid') uid: string,
  ) {
    if (!uid) {
      throw new UnauthorizedException('User ID is required');
    }
    console.log('🔐 Note update - User UID:', uid);
    return this.notesService.update(id, dto, uid);
  }
}

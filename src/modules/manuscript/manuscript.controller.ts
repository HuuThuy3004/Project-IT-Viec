import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { Public } from 'src/commons/decorators/public.decorator';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';
import { ManuscriptService } from './manuscript.service';
import { UpsertManuscriptDto } from './dtos/upsert-manuscript.dto';
import { ManuscriptQuriesDto } from './dtos/manuscript-quries.dto';

@ApiBearerAuth()
@Controller('manuscript')
export class ManuscriptController {
  constructor(private readonly manuscriptService: ManuscriptService) {}

  @Roles(ROLE.COMPANY)
  @Post('')
  async createManuscript(
    @Body() upsertManuscriptDto: UpsertManuscriptDto,
    @GetCurrentUser() user: User,
  ) {
    return this.manuscriptService.create(upsertManuscriptDto, user);
  }

  @Roles(ROLE.COMPANY)
  @Put('/update/:id')
  async updateManuscript(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatemanuscriptDto: UpsertManuscriptDto,
    @GetCurrentUser() user: User,
  ) {
    return this.manuscriptService.update(id, updatemanuscriptDto, user);
  }

  @Roles(ROLE.COMPANY)
  @Delete('/delete/:id')
  async deleteManuscript(
    @Param('id', ParseIntPipe) id: number,
    @GetCurrentUser() user: User,
  ) {
    return await this.manuscriptService.delete(id, user);
  }

  @Public()
  @Get()
  async getAllManuscripts(@Query() queries: ManuscriptQuriesDto) {
    return await this.manuscriptService.getAll(queries);
  }
}

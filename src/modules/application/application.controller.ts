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
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { ApplicationService } from './application.service';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';

@ApiBearerAuth()
@Controller('application')
export class ApplicationController {
  constructor(private readonly applicationService: ApplicationService) {}

  @Roles(ROLE.APPLICANT)
  @Post('/create')
  async createApplication(@Body() createAppDto: CreateApplicationDto, @GetCurrentUser() user: User) {
    return await this.applicationService.create(createAppDto, user);
  }

  @Roles(ROLE.COMPANY)
  @Post('/manuscript/:manuscriptId')
  async getAllByManuscript(
    @Param('manuscriptId', ParseIntPipe) manuscriptId: number,
    @GetCurrentUser() user: User,
  ) {
    return await this.applicationService.getAllByManuscript(manuscriptId, user);
  }
}

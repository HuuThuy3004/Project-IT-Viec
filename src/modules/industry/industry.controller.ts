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
import { IndustryService } from './industry.service';
import { UpsertIndustryDto } from './dtos/upsert-industry.dto';
import { IndustryQueriesDto } from './dtos/industry-query.dto';


@ApiBearerAuth()
@Controller('industry')
export class IndustryController {
  constructor(private readonly industryService: IndustryService) {}
  // CRUD - CREATE READ UPDATE DELETE
  // This api for ADMIN
  @Roles(ROLE.ADMIN) // Admin just use
  @Post('/create')
  async createindustry(@Body() upsertIndustryDto: UpsertIndustryDto) {
    return await this.industryService.create(upsertIndustryDto);
  }

  @Public()
  @Get('/:id')
  async getindustry(@Param('id', ParseIntPipe) id: number) {
    return await this.industryService.get(id);
  }
  @Public()
  @Get()
  async getAllindustry(@Query() queries: IndustryQueriesDto) {
    return await this.industryService.getAll(queries);
  }

  @Roles(ROLE.ADMIN)
  @Put('/update/:id')
  async updateindustry(
    @Param('id', ParseIntPipe) id: number,
    @Body() upsertIndustryDto: UpsertIndustryDto,
  ) {
    return this.industryService.update(id, upsertIndustryDto);
  }

  @Roles(ROLE.ADMIN)
  @Delete('/delete/:id')
  async deleteindustry(@Param('id', ParseIntPipe) id: number) {
    return this.industryService.delete(id);
  }
}

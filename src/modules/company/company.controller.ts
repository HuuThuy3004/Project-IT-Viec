import {
  Body,
  Controller,
  Param,
  ParseIntPipe,
  Put,
} from '@nestjs/common';
import { CompanyService } from './company.service';
import { Public } from 'src/commons/decorators/public.decorator';
import { Roles } from 'src/commons/decorators/roles.decorator';
import { ROLE } from 'src/commons/enums/user.enum';
import { ApiBearerAuth } from '@nestjs/swagger';
import { UpdateCompanyDto } from './dtos/update-company.dto';
import { GetCurrentUser } from 'src/commons/decorators/get-current-user.decorator';
import { User } from 'src/databases/entities/user.entity';

@ApiBearerAuth()
@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Roles(ROLE.COMPANY)
  @Put('/update/:id')
  async updatecompany(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatecompanyDto: UpdateCompanyDto,
    @GetCurrentUser() user: User
  ) {
    return this.companyService.update(id, updatecompanyDto, user);
  }
}
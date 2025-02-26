import { Module } from '@nestjs/common';
import { ManuscriptRepository } from 'src/databases/repositories/Manuscript.repository';
import { ManuscriptController } from './manuscript.controller';
import { ManuscriptService } from './manuscript.service';
import { CompanyRepository } from 'src/databases/repositories/company.repository';

@Module({
  controllers: [ManuscriptController],
  providers: [ManuscriptService, ManuscriptRepository, CompanyRepository],
})
export class ManuscriptModule {}

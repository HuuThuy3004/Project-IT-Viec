import { Module } from '@nestjs/common';
import { ManuscriptRepository } from 'src/databases/repositories/Manuscript.repository';
import { ManuscriptController } from './manuscript.controller';
import { ManuscriptService } from './manuscript.service';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { ManuscriptSkillRepository } from 'src/databases/repositories/manuscript-skill.repository';
import { RedisService } from '../redis/redis.service';

@Module({
  controllers: [ManuscriptController],
  providers: [
    ManuscriptService,
    ManuscriptRepository,
    CompanyRepository,
    ManuscriptSkillRepository,
    RedisService,
  ],
})
export class ManuscriptModule {}

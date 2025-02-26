import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { User } from 'src/databases/entities/user.entity';
import { UpsertManuscriptDto } from './dtos/upsert-manuscript.dto';
import { ManuscriptRepository } from 'src/databases/repositories/Manuscript.repository';
import { DataSource } from 'typeorm';
import { Manuscript } from 'src/databases/entities/manuscript.entity';
import { ManuscriptSkill } from 'src/databases/entities/manuscript-skill.entity';

@Injectable()
export class ManuscriptService {
  constructor(
    private readonly manuscriptRepository: ManuscriptRepository,
    private readonly companyRepository: CompanyRepository,
    private readonly dataSource: DataSource,
  ) {}

  async create(body: UpsertManuscriptDto, user: User) {
    const companyRecord = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    const { skillIds } = body;
    delete body.skillIds;

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const manuscriptRecord = await queryRunner.manager.save(Manuscript, {
        ...body,
        companyId: companyRecord.id,
      });

      const manuscriptSkills = skillIds.map((skillId) => ({
        manuscriptId: manuscriptRecord.id,
        skillId,
      }));

      await queryRunner.manager.save(ManuscriptSkill, manuscriptSkills);
      await queryRunner.commitTransaction();

      return {
        message: 'Create manuscript successfully',
        result: manuscriptRecord,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async update(id: number, body: UpsertManuscriptDto, user: User) {
    try {
      return {
        message: 'Update manuscript successfully',
        result: '....',
      };
    } catch (error) {}
  }

  async delete(id: number, user: User) {
    try {
      return {
        message: 'Delete manuscript successfully',
        result: '....',
      };
    } catch (error) {}
  }
}

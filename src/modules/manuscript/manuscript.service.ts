import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { User } from 'src/databases/entities/user.entity';
import { UpsertManuscriptDto } from './dtos/upsert-manuscript.dto';
import { ManuscriptRepository } from 'src/databases/repositories/Manuscript.repository';
import { DataSource } from 'typeorm';
import { Manuscript } from 'src/databases/entities/manuscript.entity';
import { ManuscriptSkill } from 'src/databases/entities/manuscript-skill.entity';
import { ManuscriptQuriesDto } from './dtos/manuscript-quries.dto';
import { convertKeySortManuscript } from 'src/commons/utils/helper';

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
    // Validate HR have in company ??
    const companyRecord = await this.companyRepository.findOneBy({
      userId: user.id,
    });

    const manuscriptRecord = await this.manuscriptRepository.findOneBy({
      id,
    });

    if (companyRecord.id !== manuscriptRecord.companyId) {
      throw new HttpException('User Forbidden', HttpStatus.FORBIDDEN);
    }

    await this.manuscriptRepository.softDelete(id);

    return {
      message: 'Delete manuscript successfully',
    };
  }


  async getAll(queries: ManuscriptQuriesDto) {
    console.log('queries', queries);
    const {
      page,
      limit,
      keyword,
      companyAddress,
      companyTypes,
      levels,
      workingModel,
      industryIds,
      minSalary,
      maxSalary,
      sort,
    } = queries;

    const skip = (page - 1) * limit

    const queryBuilder = this.manuscriptRepository
      .createQueryBuilder('manuscript')
      .leftJoin('manuscript.company', 'c')
      .leftJoin('manuscript.manuscriptSkills', 'm')
      .leftJoin('m.skill', 's')
      .select([
        'manuscript.id AS "id"',
        'manuscript.title AS "title"',
        'manuscript.minSalary AS "minSalary"',
        'manuscript.maxSalary AS "maxSalary"',
        'manuscript.summary AS "summary"',
        'manuscript.level AS "level"',
        'manuscript.workingModel AS "workingModel"',
        'manuscript.createdAt AS "createdAt"',
        'c.id AS "companyId"',
        'c.name AS "companyName"',
        'c.location AS "companyAddress"',
        'c.companySize AS "companySize"',
        'c.companyType AS "companyType"',
        'c.industry AS "companyIndustry"',
        'c.logo AS "companyLogo"',
        "JSON_AGG(json_build_object('id', s.id, 'name', s.name)) AS manuscriptSkills"
      ])
      .groupBy('manuscript.id, c.id')
  
    if (companyAddress) queryBuilder.andWhere('c.location = :address', { address: companyAddress })
  
    if (companyTypes) queryBuilder.andWhere('c.companyType IN (:...companyTypes)', { companyTypes })
  
    if (levels) queryBuilder.andWhere('manuscript.level IN (:...levels)', { levels })
  
    if (workingModel) queryBuilder.andWhere('manuscript.workingModel IN (:...workingModel)', { workingModel })
  
    if (industryIds) queryBuilder.andWhere('c.industry IN (:...industryIds)', { industryIds })
  
    if (minSalary) queryBuilder.andWhere('manuscript.minSalary >= :minSalary', { minSalary })
  
    if (maxSalary) queryBuilder.andWhere('manuscript.maxSalary <= :maxSalary', { maxSalary })
  
    queryBuilder.limit(limit).offset(skip)

    if (companyAddress) queryBuilder.andWhere('c.location = :address', { address: companyAddress });

    if (companyTypes) queryBuilder.andWhere('c.companyType IN (:...companyTypes)', { companyTypes });

    if (levels) queryBuilder.andWhere('manuscript.level IN (:...levels)', { levels });

    if (workingModel) queryBuilder.andWhere('manuscript.workingModel IN (:...workingModel)', { workingModel });

    if (industryIds) queryBuilder.andWhere('c.industry IN (:...industryIds)', { industryIds });

    if (minSalary) queryBuilder.andWhere('manuscript.minSalary >= :minSalary', { minSalary });

    if (maxSalary) queryBuilder.andWhere('manuscript.maxSalary <= :maxSalary', { maxSalary });

    if (keyword) {
      queryBuilder.andWhere('s.name ILIKE :keyword', { keyword: `%${keyword}%` })
      .orWhere('manuscript.title ILIKE :keyword', { keyword: `%${keyword}%`} )
      .orWhere('manuscript.summary ILIKE :keyword', { keyword: `%${keyword}%`} )
      .orWhere('c.name ILIKE :keyword', { keyword: `%${keyword}%`} )
    }

    if (sort) {
      const order = convertKeySortManuscript(sort)
      console.log('order', order);
      for (const key of Object.keys(order)) {
        queryBuilder.addOrderBy(key, order[key])
      }
    } else {
      queryBuilder.addOrderBy('manuscript.createdAt', 'DESC')
    }


    queryBuilder.limit(limit).offset(skip)
    const [data, total] = await Promise.all([
      queryBuilder.getRawMany(),
      queryBuilder.getCount(),
    ])

    return {
      message: 'Get all manuscripts successfully',
      result: {
        total,
        page,
        limit,
        data,
      },
    }
  }

}




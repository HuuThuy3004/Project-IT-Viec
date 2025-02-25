import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { ILike } from 'typeorm';
import { UpsertIndustryDto } from './dtos/upsert-industry.dto';
import { IndustryQueriesDto } from './dtos/industry-query.dto';
import { IndustryRepository } from 'src/databases/repositories/industry.repository';

@Injectable()
export class IndustryService {
  constructor(private readonly industryRepository: IndustryRepository) {}

  async create(upsertindustryDto: UpsertIndustryDto) {
    const industryRecord = await this.industryRepository.save(upsertindustryDto);
    return {
      message: 'industry created successfully',
      result: industryRecord,
    };
  }

  async get(id: number) {
    const industryRecord = await this.industryRepository.findOneBy({ id });
    return {
      message: 'industry fetched successfully',
      result: industryRecord,
    };
  }

  async update(id: number, updateindustryDto: UpsertIndustryDto) {
    const industryRecord = await this.industryRepository.findOneBy({ id });
    if (!industryRecord) {
      throw new HttpException('industry not found', HttpStatus.NOT_FOUND);
    }
    const result = await this.industryRepository.save({
      ...industryRecord,
      ...updateindustryDto,
    });
    return {
      message: 'industry updated successfully',
      result: result,
    };
  }

  async delete(id: number) {
    const industryRecord = await this.industryRepository.findOneBy({ id });
    await this.industryRepository.remove(industryRecord);
    return {
      message: 'industry deleted successfully',
    };
  }

  async getAll(queries: IndustryQueriesDto) {
    const { name } = queries;
    const whereClause = name ? { name: ILike(`%${name}%`) } : {};
    const result = await this.industryRepository.find({
      where: whereClause,
    });
    return {
      message: 'Get detail industry successfully',
      result,
    };
  }
}

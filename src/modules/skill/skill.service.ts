import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SkillRepository } from 'src/databases/repositories/skill.repository';
import { UpsertSkillDto } from './dtos/upsert-skill.dto';
import { UpdateSkillDto } from './dtos/update-skill.dto';
import { SkillQueriesDto } from './dtos/skill-query.dto';
import { ILike } from 'typeorm';

@Injectable()
export class SkillService {
  constructor(private readonly skillRepository: SkillRepository) {}

  async create(upsertSkillDto: UpsertSkillDto) {
    const skillRecord = await this.skillRepository.save(upsertSkillDto);
    return {
      message: 'Skill created successfully',
      result: skillRecord,
    };
  }

  async get(id: number) {
    const skillRecord = await this.skillRepository.findOneBy({ id });
    return {
      message: 'Skill fetched successfully',
      result: skillRecord,
    };
  }

  async update(id: number, updateSkillDto: UpdateSkillDto) {
    const skillRecord = await this.skillRepository.findOneBy({ id });
    if (!skillRecord) {
      throw new HttpException('Skill not found', HttpStatus.NOT_FOUND);
    }
    const result = await this.skillRepository.save({
      ...skillRecord,
      ...updateSkillDto,
    });
    return {
      message: 'Skill updated successfully',
      result: result,
    };
  }

  async delete(id: number) {
    const skillRecord = await this.skillRepository.findOneBy({ id });
    await this.skillRepository.remove(skillRecord);
    return {
      message: 'Skill deleted successfully',
    };
  }

  async getAll(queries: SkillQueriesDto) {
    const { searchName } = queries; 
    const whereClause = searchName ? { name: ILike(`%${searchName}%`) } : {};
    const result = await this.skillRepository.find({
      where: whereClause,
    })  
    return {
      message: 'Get detail skill successfully',
      result,
    }
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateApplicationDto } from './dtos/create-application.dto';
import { User } from 'src/databases/entities/user.entity';
import { ApplicationRepository } from 'src/databases/repositories/application.repository';
import { ManuscriptRepository } from 'src/databases/repositories/Manuscript.repository';
import { StorageService } from '../storage/storage.service';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';

@Injectable()
export class ApplicationService {
  constructor(
    private readonly applicationRepository: ApplicationRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly manuscriptRepository: ManuscriptRepository,
    private readonly storageService: StorageService,
  ) {}

  async create(body: CreateApplicationDto, user: User) {
    const manuscriptRecord = await this.manuscriptRepository.findOne({
      where: {
        id: body.manuscriptId,
      },
    });

    if (!manuscriptRecord) {
      throw new HttpException('Manuscript Not Found', HttpStatus.NOT_FOUND);
    }

    const applicantRecord = await this.applicantRepository.findOne({
      where: {
        userId: user.id,
      },
    });

    if (body.resume) {
      await this.storageService.getSignedUrl(body.resume);
    }

    const payload = {
      ...body,
      applicantId: applicantRecord.id,
    };

    const applicationRecord = await this.applicationRepository.save(payload);

    return {
      message: 'Application created successfully',
      result: applicationRecord,
    };
  }

  async getAllByManuscript(manuscriptId: number, user: User) {
    const manuscriptRecord = await this.manuscriptRepository.findOne({
      where: {
        id: manuscriptId,
      },
      relations: ['company'],
    });

    if (!manuscriptRecord) {
      throw new HttpException('Manuscript Not Found', HttpStatus.NOT_FOUND);
    }

    if (manuscriptRecord.company.userId !== user.id) {
      throw new HttpException('Company Not Access', HttpStatus.FORBIDDEN);
    }
    const applicationRecord = await this.applicationRepository.find({
      where: {
        manuscriptId,
      },
      relations: ['applicant'],
    });

    return {
      message: 'Get detail Applications successfully',
      result: applicationRecord,
    };
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common'
import { CompanyRepository } from 'src/databases/repositories/company.repository'
import { UpdateCompanyDto } from './dtos/update-company.dto'
import { User } from 'src/databases/entities/user.entity'
import { StorageService } from '../storage/storage.service'
import { IndustryRepository } from 'src/databases/repositories/industry.repository'

@Injectable()
export class CompanyService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly industryRepository: IndustryRepository,
    private readonly storageService: StorageService,
  ) {}

  async update(id: number, updatecompanyDto: UpdateCompanyDto, user: User) {
    // Verify that only that company can update that company
    const companyRecord = await this.companyRepository.findOneBy({
      id,
      userId: user.id,
    })
    console.log('companyRecord', companyRecord)
    // Check user exists
    if (!companyRecord) {
      throw new HttpException('company not found', HttpStatus.NOT_FOUND)
    }

    // Handle save logo
    if (updatecompanyDto.logo) {
      await this.storageService.getSignedUrl(updatecompanyDto.logo)
    }

    // Validate industry
    const industryRecord = await this.industryRepository.findOneBy({
      id: updatecompanyDto.industryId,
    })

    if (!industryRecord) {
      throw new HttpException(
        `Industry not found with id: ${updatecompanyDto.industryId}`,
        HttpStatus.NOT_FOUND,
      )
    }

    // Save company updated to database
    const companyUpdate = await this.companyRepository.save({
      ...companyRecord,
      ...updatecompanyDto,
    })

    // Return link file image url
    if (companyUpdate.logo) {
      companyUpdate.logo = await this.storageService.getSignedUrl(
        companyUpdate.logo,
      )
    }

    // Delete old logo if it's different from new logo
    if (companyRecord.logo !== updatecompanyDto.logo) {
      await this.storageService.delete(companyRecord.logo)
    }

    return {
      message: 'Company updated successfully',
      result: companyUpdate,
    }
  }
}

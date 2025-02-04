import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { CompanyRepository } from 'src/databases/repositories/company.repository';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    ApplicantRepository,
    JwtService,
    ConfigService,
    CompanyRepository,
  ],
})
export class AuthModule {}

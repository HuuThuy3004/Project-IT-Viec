import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserRepository } from 'src/databases/repositories/user.repository';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [AuthController],
  providers: [AuthService, UserRepository, ApplicantRepository, JwtService, ConfigService]
})
export class AuthModule {}

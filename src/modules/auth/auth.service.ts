import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserRepository } from 'src/databases/repositories/user.repository';
import * as argon2 from 'argon2';
import { LOGIN_TYPE, ROLE } from 'src/commons/enums/user.enum';
import { ApplicantRepository } from 'src/databases/repositories/applicant.repository';
import { LoginUserDto } from './dtos/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { User } from 'src/databases/entities/user.entity';
import { LoginGoogleDto } from './dtos/login-google.dto';
import { OAuth2Client } from 'google-auth-library';
import { RegisterCompanyDto } from './dtos/register-company.dto';
import { CompanyRepository } from 'src/databases/repositories/company.repository';
import { DataSource } from 'typeorm';
import { Company } from 'src/databases/entities/company.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    // private readonly companyRepository: CompanyRepository,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
  ) {}

  async registerUser(registerUserDto: RegisterUserDto) {
    const { username, password, email } = registerUserDto;

    // Check email exists
    const userExist = await this.userRepository.findOneBy({ email });
    if (userExist) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    // Hash password of user
    const hashPassword = await argon2.hash(password);

    // Create new user and applicant record to save to database
    const newUser = await this.userRepository.save({
      username,
      email,
      password: hashPassword,
      loginType: LOGIN_TYPE.EMAIL,
      role: ROLE.APPLICANT,
    });
    await this.applicantRepository.save({
      userId: newUser.id,
    });

    // Send mail here
    await this.mailService.sendMail(
      email,
      'Welcom to IT viec',
      'welcome-application',
      {
        name: username,
        email: email,
      },
    );

    return {
      message: 'User registered successfully',
      user: newUser,
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Check if user email exists
    const userRecord = await this.userRepository.findOneBy({ email: email });
    if (!userRecord) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Compare password from user to database password
    const isPasswordValid = await argon2.verify(userRecord.password, password);
    if (!isPasswordValid) {
      throw new HttpException(
        'Incorrect email or password',
        HttpStatus.UNAUTHORIZED,
      );
    }

    // Generate JWT access token
    const payload = await this.getPayload(userRecord);
    const { accessToken, refreshToken } = await this.signToken(payload);

    return {
      message: 'Login successfully',
      result: {
        accessToken,
        refreshToken,
      },
    };
  }

  async refresh(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken: oldRefreshToken } = refreshTokenDto;

    //Verify refresh token
    const payloadRefreshToken = await this.jwtService.verifyAsync(
      oldRefreshToken,
      {
        secret: this.configService.get('jwtAuth').jwtRefreshTokenSecret,
      },
    );
    if (!payloadRefreshToken) {
      throw new HttpException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }

    // Check if user exists in database by id from refresh token payload
    const userRecord = await this.userRepository.findOneBy({
      id: payloadRefreshToken.id,
    });
    if (!userRecord) {
      throw new HttpException('User not found', HttpStatus.UNAUTHORIZED);
    }

    // Generate JWT access token
    const payload = await this.getPayload(userRecord);
    const { accessToken, refreshToken } = await this.signToken(payload);

    return {
      message: 'Refresh token successfully',
      result: {
        accessToken,
        refreshToken,
      },
    };
  }

  async getPayload(user: User) {
    return {
      id: user.id,
      username: user.username,
      loginType: user.loginType,
      role: user.role,
    };
  }

  async signToken(payloadAccess) {
    const payloadRefresh = {
      id: payloadAccess.id,
    };

    const accessToken = await this.jwtService.signAsync(payloadAccess, {
      secret: this.configService.get('jwtAuth').jwtTokenSecret,
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payloadRefresh, {
      secret: this.configService.get('jwtAuth').jwtRefreshTokenSecret,
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }

  async loginGoogle(loginGoogleDto: LoginGoogleDto) {
    const { token } = loginGoogleDto;

    const googleClientId = this.configService.get('google').clientId;
    const googleClientSecret = this.configService.get('google').clientSecret;

    const oAuth2Client = new OAuth2Client(googleClientId, googleClientSecret);
    const googleLoginTicket = await oAuth2Client.verifyIdToken({
      idToken: token,
      audience: googleClientId,
    });

    // Verify google login ticket payload
    const { email_verified, email, name } = googleLoginTicket.getPayload();

    if (!email_verified) {
      throw new HttpException(
        'Email is not verified: ' + email,
        HttpStatus.FORBIDDEN,
      );
    }

    // Check user exists
    let userRecord = await this.userRepository.findOneBy({ email: email });

    // If user exists, return user
    if (userRecord && userRecord.loginType === LOGIN_TYPE.EMAIL) {
      throw new HttpException(
        'This user registed with email: ' + email + '. Please login !',
        HttpStatus.FORBIDDEN,
      );
    }

    // If user doesn't exist, create new user
    if (!userRecord) {
      userRecord = await this.userRepository.save({
        email,
        username: name,
        loginType: LOGIN_TYPE.GOOGLE,
      });

      await this.applicantRepository.save({
        userId: userRecord.id,
      });
    }

    const payload = await this.getPayload(userRecord);
    const { accessToken, refreshToken } = await this.signToken(payload);

    return {
      message: 'Login with google successfully',
      result: {
        accessToken,
        refreshToken,
      },
    };
  }

  async registerCompany(registerCompanyDto: RegisterCompanyDto) {
    const {
      username,
      email,
      password,
      companyName,
      companyAddress,
      companyWebsite,
    } = registerCompanyDto;

    // Check email exists
    const userRecord = await this.userRepository.findOneBy({ email: email });
    if (userRecord) {
      throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
    }

    // Hash password of user
    const hashPassword = await argon2.hash(password);

    // Create new company record to save to database
    const queryRuner = this.dataSource.createQueryRunner();
    await queryRuner.connect();
    // Before object user and company is created to database then we will write a command: queryRuner.startTransaction()
    await queryRuner.startTransaction();

    try {
      // Create new user -> Use queryRunner.manager
      const newUser = await queryRuner.manager.save(User, {
        username,
        email,
        password: hashPassword,
        loginType: LOGIN_TYPE.EMAIL,
        role: ROLE.COMPANY,
      });

      // Create new company by user
      await queryRuner.manager.save(Company, {
        userId: newUser.id,
        name: companyName,
        location: companyAddress,
        website: companyWebsite,
      });
      await queryRuner.commitTransaction();

      return {
        message: 'Company registered successfully',
      };
    } catch (error) {
      console.log(error);
      // If any error occurs, we will rollback the transaction
      await queryRuner.rollbackTransaction();
    } finally {
      // Release the query runner
      await queryRuner.release();
    }
  }
}

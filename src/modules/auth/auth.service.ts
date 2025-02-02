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

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly applicantRepository: ApplicantRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
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

    return {
      message: 'User registered successfully',
      user: newUser,
    };
  }

  async loginUser(loginUserDto: LoginUserDto) {
    const { email, password } = loginUserDto;

    // Check if user email exists
    const userRecord = await this.userRepository.findOneBy({ email });
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

  async loginGoogle(body: LoginGoogleDto) {
    const { token } = body;
    const ggClientId = this.configService.get('google').clientId;
    const ggClientSecret = this.configService.get('google').clientSecret;
    const oAuthClient = new OAuth2Client(ggClientId, ggClientSecret);
    const ggLoginTicket = await oAuthClient.verifyIdToken({
      idToken: token,
      audience: ggClientId,
    });

    const { email_verified, email, name } = (await ggLoginTicket).getPayload();
    if (!email_verified) {
      throw new HttpException(
        'Email is not verified' + email,
        HttpStatus.FORBIDDEN,
      );
    }

    let userRecord = await this.userRepository.findOneBy({
      email,
      loginType: LOGIN_TYPE.GOOGLE,
    });

    if (userRecord && userRecord.loginType === LOGIN_TYPE.EMAIL) {
      throw new HttpException(
        'Email use to login:' + email,
        HttpStatus.FORBIDDEN,
      );
    }

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
    const { accessToken, refreshToken: newRefreshToken } =
      await this.signToken(payload);
    return {
      message: 'Login with google successfully',
      result: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    };
  }
}

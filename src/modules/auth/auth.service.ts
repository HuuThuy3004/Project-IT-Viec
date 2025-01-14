import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { UserRepository } from "src/databases/repositories/user.repository";
import * as argon2 from "argon2";
import { LOGIN_TYPE, ROLE } from "src/commons/enums/user.enum";
import { ApplicantRepository } from "src/databases/repositories/applicant.repository";
import { LoginUserDto } from "./dtos/login-user.dto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly applicantRepository: ApplicantRepository,
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService
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
            userId: newUser.id
        });

        return {
            message: 'User registered successfully',
            user: newUser,
        };
    }

    async loginUser(loginUserDto: LoginUserDto) {
        const { email, password } = loginUserDto;

        // Check if user email exists
        const userExistByEmail = await this.userRepository.findOneBy({ email });
        if (!userExistByEmail) {
            throw new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED);
        }

        // Compare password from user to database password
        const isPasswordValid = await argon2.verify(userExistByEmail.password, password);
        if (!isPasswordValid) {
            throw new HttpException('Incorrect email or password', HttpStatus.UNAUTHORIZED);
        }

        // Create token for user
        const payload = { 
            id: userExistByEmail.id, 
            username: userExistByEmail.username, 
            loginType: userExistByEmail.loginType, 
            role: userExistByEmail.role, 
        };

        // Generate JWT token for user
        const access_token = await this.jwtService.signAsync(payload, {
            secret: this.configService.get('jwtAuth').jwtTokenSecret,
            expiresIn: this.configService.get('jwtAuth').expiresIn,
        });

        return {
            message: 'Login successfully',
            result: {
                access_token
            }
        };
    }


}

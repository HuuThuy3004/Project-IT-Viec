import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { RegisterUserDto } from "./dtos/register-user.dto";
import { UserRepository } from "src/databases/repositories/user.repository";
import * as argon2 from "argon2";
import { LOGIN_TYPE, ROLE } from "src/commons/enums/user.enum";
import { ApplicantRepository } from "src/databases/repositories/applicant.repository";

@Injectable()
export class AuthService {
    constructor(
        private readonly userRepository: UserRepository,
        private readonly applicantRepository: ApplicantRepository,
    ) {}
    async registerUser(registerUserDto: RegisterUserDto) {
        const { username, password, email } = registerUserDto;

        // Check email exists
        const userExist = await this.userRepository.findOneBy({ email }); 
        if (userExist) {
            throw new HttpException('Email already exists', HttpStatus.BAD_REQUEST);
        }

        // Hash password
        const hashPassword = await argon2.hash(password);

        // Create new user and applicant record to database
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

    async loginUser() {

    }


}

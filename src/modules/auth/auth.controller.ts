import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}
    @Post('/register')
    registerUser(@Body() registerUserDto: RegisterUserDto) {
        return this.authService.registerUser(registerUserDto)
    }
}

import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginUserDto } from './dtos/login-user.dto';
import { AuthGuard } from './auth.guard';
import { RefreshTokenDto } from './dtos/refresh-token.dto';
import { Public } from 'src/commons/decorators/public.decorator';
import { LoginGoogleDto } from './dtos/login-google.dto';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @Post('/register')
  registerUser(@Body() registerUserDto: RegisterUserDto) {
    return this.authService.registerUser(registerUserDto);
  }
  
  @Public()
  @Post('/login')
  loginUser(@Body() loginUserDto: LoginUserDto) {
    return this.authService.loginUser(loginUserDto);
  }

  @Public()
  @Post('/refresh')
  refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refresh(refreshTokenDto);
  }

  @Public()
  @Post('/login-google')
  loginGoogle(@Body() loginGoogleDto: LoginGoogleDto) {
    return this.authService.loginGoogle(loginGoogleDto);
  }
}



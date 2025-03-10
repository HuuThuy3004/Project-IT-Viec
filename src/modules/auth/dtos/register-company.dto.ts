import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from 'src/commons/decorators/is-strong-password.decorator';
import { COMPANY_ADDRESS } from 'src/commons/enums/company.enum';

export class RegisterCompanyDto {
  @ApiProperty({ example: 'user' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'user@gmail.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'User213141424!' })
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @ApiProperty({ example: 'panasonic' })
  @IsString()
  @IsNotEmpty()
  companyName: string;

  @ApiProperty({ example: COMPANY_ADDRESS.DA_NANG })
  @IsEnum(COMPANY_ADDRESS)
  @IsNotEmpty()
  companyAddress: COMPANY_ADDRESS;

  @ApiProperty({ example: 'https://itviec.com/' })
  @IsString()
  @IsNotEmpty()
  companyWebsite: string;
}

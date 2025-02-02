import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';
import { IsStrongPassword } from 'src/commons/decorators/is-strong-password.decorator';

export class RefreshTokenDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywiaWF0IjoxNzM3MjkwNDgzLCJleHAiOjE3Mzc4OTUyODN9.d7xTg98fNxUGrTKL486NxVxDkjzuWj3REI_tj3G7an4',
  })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

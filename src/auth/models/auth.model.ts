import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AuthRequestModel {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'email',
  })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Password',
  })
  readonly password: string;
}

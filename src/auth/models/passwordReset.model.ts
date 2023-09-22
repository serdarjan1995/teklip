import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty, IntersectionType, PickType } from '@nestjs/swagger';

export class PasswordResetCheckAuthCodeModel {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'email',
  })
  readonly email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Code',
  })
  readonly code: string;
}

export class PasswordModel {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Password',
  })
  readonly password: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Password Confirmation',
  })
  readonly passwordConfirmation: string;
}

export class PasswordResetModel extends IntersectionType(
  PasswordResetCheckAuthCodeModel,
  PasswordModel,
) {}

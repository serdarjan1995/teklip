import {
  IsDate,
  IsEnum,
  IsNotEmpty,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export enum AUTH_CODE_TYPE_ENUM {
  email_verification = 'email_verification',
  phone_number_verification = 'phone_number_verification',
  password_reset_verification = 'password_reset_verification',
}

export const AuthCodeSchema = new mongoose.Schema({
  type: { type: String, required: true, enum: AUTH_CODE_TYPE_ENUM },
  code: { type: String, required: true },
  userId: { type: String, required: true },
  expiresAt: { type: String, required: false },
});

export class AuthCode {
  @IsString()
  @IsEnum(AUTH_CODE_TYPE_ENUM)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Auth code type',
    example: AUTH_CODE_TYPE_ENUM.email_verification,
  })
  readonly type: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'Auth code',
    example: '123456',
  })
  readonly code: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: 'User ID',
    example: 'abcd123456',
  })
  readonly userId: string;

  @IsNotEmpty()
  @IsDate()
  @ApiProperty({
    description: 'Expiry date',
    example: 'Wed Aug 09 2023 12:55:32 GMT+0300 (GMT+03:00)',
  })
  readonly expiresAt: Date;
}

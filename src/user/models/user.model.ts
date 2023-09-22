import * as mongoose from 'mongoose';
import {
  IsBoolean,
  IsDate,
  IsEmail, IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString, IsUrl,
  Length,
} from 'class-validator';
import {
  ApiProperty,
  ApiPropertyOptional,
  IntersectionType,
  PickType,
} from '@nestjs/swagger';

export enum GENDER {
  man = 'man',
  woman = 'woman',
}

export const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  surname: { type: String, required: true },
  gender: { type: String, required: false, enum: GENDER },
  dob: { type: Date, required: false },
  profileImage: { type: String, required: false },
  profileBannerImage: { type: String, required: false },
  companyName: { type: String, required: false },
  phoneNumber: { type: String, required: false, unique: true, sparse: true },
  email: { type: String, required: true, unique: true },
  isActive: { type: Boolean, required: false, default: true },
  isPhoneNumberVerified: { type: Boolean, required: false, default: false },
  isEmailAddressVerified: { type: Boolean, required: false, default: false },
  isCompanyProfile: { type: Boolean, required: false, default: false },
  password: { type: String, required: true, select: false },
  rating: { type: Number, required: false, default: 0.0, max: 5, min: 0 },
  lastLogin: { type: Date, required: false },
  createdAt: { type: Date, required: true, default: new Date() },
  updatedAt: { type: Date, required: true, default: new Date() },
});

// export interface User {
//   id: string;
//   name: string;
//   surname: string;
//   companyName: string;
//   phoneNumber: string;
//   email: string;
//   isActive: boolean;
//   isPhoneNumberVerified: boolean;
//   isEmailAddressVerified: boolean;
//   isCompanyProfile: boolean;
//   lastLogin: Date;
//   password: string;
//   createdAt: Date;
//   updatedAt: Date;
// }

export class User {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User id',
    example: 'ab135c12412',
  })
  id: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 30)
  @ApiProperty({
    description: 'Name of the user',
    example: 'John',
  })
  name: string;

  @IsString()
  @IsNotEmpty()
  @Length(3, 50)
  @ApiProperty({
    description: 'Surname of the user',
    example: 'Doe',
  })
  surname: string;

  @IsString()
  @IsEnum(GENDER)
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Gender',
    example: GENDER.man,
  })
  gender: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Date of birth',
  })
  dob: Date;

  @IsString()
  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Profile image',
  })
  profileImage: string;

  @IsString()
  @IsUrl()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Profile banner image',
  })
  profileBannerImage: string;

  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Email of the user',
    example: 'john.doe@example.com',
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Phone number of the user',
    example: '+905551234567',
  })
  phoneNumber: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Company name if desired',
    example: 'ABC company',
  })
  companyName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Password',
  })
  password: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Is user account active',
  })
  isActive: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Is user phone number verified',
  })
  isPhoneNumberVerified: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Is user email address verified',
  })
  isEmailAddressVerified: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Is user account is switched to company account',
  })
  isCompanyProfile: boolean;

  @IsNumber()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'User rating',
  })
  rating: number;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Last login datetime',
  })
  lastLogin: Date;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Created at',
  })
  createdAt: Date;

  @IsDate()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Updated at',
  })
  updatedAt: Date;
}

export class UserPasswordConfirm {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Password confirmation',
  })
  passwordConfirmation: string;
}

export class UserRegistration extends IntersectionType(
  UserPasswordConfirm,
  PickType(User, ['name', 'surname', 'email', 'password'] as const),
) {}

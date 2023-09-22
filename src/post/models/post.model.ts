import * as mongoose from 'mongoose';
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDate,
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { PostImageModel, PostImageSchema } from './postImage.model';
import { VehicleDetailsModel } from './vehicleDetails.model';
import { PropertyDetailsModel } from './propertyDetails.model';

export enum POST_CATEGORY {
  vehicle = 'vehicle',
  property = 'property',
}

export enum POST_CONTACT_TYPE {
  chat = 'chat',
  phone = 'phone',
}

export enum POST_STATUS {
  moderation = 'moderation',
  changes_required = 'changes_required',
  rejected = 'rejected',
  published = 'published',
  banned = 'banned',
}

export const PostSchema = new mongoose.Schema({
  postCategory: { type: String, required: true, enum: POST_CATEGORY },
  title: { type: String, required: true },
  description: { type: String, required: true },
  isFeatured: { type: Boolean, required: true },
  ownerId: { type: String, required: true },
  location: { type: String, required: true },
  price: { type: Number, required: true },
  status: {
    type: String,
    required: true,
    enum: POST_STATUS,
    default: POST_STATUS.moderation,
  },
  contactType: { type: String, required: true, enum: POST_CONTACT_TYPE },
  contactPhone: { type: String, required: true },
  creditEligible: { type: Boolean, required: true, default: false },
  swapEligible: { type: Boolean, required: true, default: false },
  images: { type: [{ type: PostImageSchema }], required: true },
  details: { type: Boolean, required: true },
  moderatedBy: { type: String, required: false },
  publishedAt: { type: Date, required: false },
  createdAt: { type: Date, required: true, default: new Date() },
  updatedAt: { type: Date, required: true, default: new Date() },
});

export class PostDetails {}

export class PostModel {
  @IsString()
  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Post id',
    example: 'ab135c12412',
  })
  id: string;

  @IsString()
  @IsEnum(POST_CATEGORY)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Post category',
    example: POST_CATEGORY.vehicle,
  })
  postCategory: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Title',
    example: 'Post title',
  })
  title: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Description',
    example: 'Post description',
  })
  description: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Is featured',
    example: true,
  })
  isFeatured: boolean;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Owner ID',
  })
  ownerId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Location',
  })
  location: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Price',
  })
  price: number;

  @IsString()
  @IsEnum(POST_STATUS)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Post status',
    example: POST_STATUS.moderation,
  })
  status: string;

  @IsString()
  @IsEnum(POST_CONTACT_TYPE)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Post contact type',
    example: POST_CONTACT_TYPE.phone,
  })
  contactType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Post contact phone number',
  })
  contactPhone: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Credit eligible',
    default: false,
  })
  creditEligible: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Swap eligible',
    default: false,
  })
  swapEligible: boolean;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => PostImageModel)
  @ApiProperty({
    description: 'Post Images',
  })
  images: PostImageModel[];

  @IsObject()
  @ValidateNested()
  @Type(() => PostDetails, {
    discriminator: {
      property: '__type',
      subTypes: [
        { value: VehicleDetailsModel, name: 'vehicleDetails' },
        { value: PropertyDetailsModel, name: 'propertyDetails' },
      ],
    },
  })
  @ApiProperty({
    description: 'Post Details',
  })
  details: VehicleDetailsModel | PropertyDetailsModel;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Moderated by',
  })
  moderatedBy: string;

  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Reject reason',
  })
  rejectReason: string;

  @IsDate()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Published at',
  })
  publishedAt: Date;

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

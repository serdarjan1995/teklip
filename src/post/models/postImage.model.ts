import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import mongoose from 'mongoose';

export const PostImageSchema = new mongoose.Schema({
  caption: { type: String, required: false },
  url: { type: String, required: true },
});

export class PostImageModel {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Caption',
    example: 'Image caption',
  })
  caption: string;

  @IsString()
  @IsUrl()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Image URL',
    example: 'Image url',
  })
  url: string;
}

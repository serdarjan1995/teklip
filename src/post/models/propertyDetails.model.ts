import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PropertyDetailsModel {
  @IsString()
  @IsOptional()
  @ApiPropertyOptional({
    description: 'Caption',
    example: 'Image caption',
  })
  caption: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Image URL',
    example: 'Image url',
  })
  url: string;
}

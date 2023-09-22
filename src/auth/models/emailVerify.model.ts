import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailVerifyModel {
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

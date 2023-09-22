import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import mongoose from 'mongoose';

export const VehicleDetailsSchema = new mongoose.Schema({
  caption: { type: String, required: false },
  url: { type: String, required: true },
});

export enum VEHICLE_TYPE {
  car = 'car',
  motorcycle = 'motorcycle',
  heavy_vehicle = 'heavy_vehicle',
}

export enum VEHICLE_TRANSMISSION_TYPE {
  auto = 'auto',
  manual = 'manual',
  cvt = 'cvt',
  robotic = 'robotic',
  semiAuto = 'semiAuto',
}

export enum VEHICLE_ENGINE_TYPE {
  diesel = 'diesel',
  petrol = 'petrol',
  electric = 'electric',
  hybrid = 'hybrid',
}

export enum VEHICLE_INTERIOR_TYPE {
  leather = 'leather',
  suede = 'suede',
  wood = 'wood',
  vinyl = 'vinyl',
  velour = 'velour',
  combined = 'combined',
}

export enum VEHICLE_LIGHTS_TYPE {
  xenon = 'xenon',
  halogen = 'halogen',
  led = 'led',
}

export enum VEHICLE_AUDIO_SYSTEM_TYPE {
  'two' = 'two',
  'four' = 'four',
  'six' = 'six',
  'eight_p' = 'eight_p',
}

export class VehicleDetailsModel {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Manufacturer',
    example: 'Audi',
  })
  manufacturer: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Model',
    example: 'A8',
  })
  model: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Manufactured year',
    example: '2012',
  })
  year: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Color',
    example: 'white',
  })
  color: string;

  @IsString()
  @IsEnum(VEHICLE_TYPE)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Vehicle Type',
    example: VEHICLE_TYPE.car,
    enum: VEHICLE_TYPE,
  })
  vehicleType: string;

  @IsString()
  @IsEnum(VEHICLE_ENGINE_TYPE)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Engine Type',
    example: VEHICLE_ENGINE_TYPE.petrol,
    enum: VEHICLE_ENGINE_TYPE,
  })
  engineType: string;

  @IsString()
  @IsEnum(VEHICLE_TRANSMISSION_TYPE)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Transmission Type',
    example: VEHICLE_TRANSMISSION_TYPE.auto,
    enum: VEHICLE_TRANSMISSION_TYPE,
  })
  transmissionType: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Engine',
  })
  engine: string;

  @IsNumber()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Mileage',
  })
  mileage: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'VIN code',
  })
  vinCode: number;
}

export class VehicleAdditionalDetailsModel {
  @IsString()
  @IsEnum(VEHICLE_INTERIOR_TYPE)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Interior Type',
    example: VEHICLE_INTERIOR_TYPE.leather,
    enum: VEHICLE_INTERIOR_TYPE,
  })
  interior: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Interior Color',
  })
  interiorColor: string;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Has Leather Steering Wheel',
  })
  hasLeatherSteeringWheel: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Has Sunroof',
  })
  hasSunroof: boolean;

  @IsBoolean()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Has Sunroof',
  })
  hasSunroof: boolean;
}

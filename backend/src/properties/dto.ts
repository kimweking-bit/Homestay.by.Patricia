import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from "class-validator";
import { PropertyStatus } from "@prisma/client";

export class PropertyImageInput {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  url!: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  publicId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  alt?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  caption?: string;

  @IsOptional()
  @IsString()
  @MaxLength(40)
  category?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(500)
  sortOrder?: number;
}

export class PropertyRoomInput {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(500)
  imageUrl!: string;
}

export class CreatePropertyDto {
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  id!: string;

  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(400)
  shortDescription!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(160)
  location!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  area!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(80)
  propertyType!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  collection?: string;

  @IsInt()
  @Min(0)
  @Max(50)
  bedrooms!: number;

  @IsInt()
  @Min(0)
  @Max(50)
  beds!: number;

  @IsInt()
  @Min(0)
  @Max(50)
  bathrooms!: number;

  @IsInt()
  @Min(1)
  @Max(50)
  maxGuests!: number;

  @IsInt()
  @Min(0)
  @Max(1_000_000)
  pricePerNight!: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @IsString()
  @MinLength(1)
  @MaxLength(200)
  imageAlt!: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  amenities!: string[];

  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  @MaxLength(300, { each: true })
  houseRules!: string[];

  @IsArray()
  @ArrayMaxSize(40)
  @ValidateNested({ each: true })
  @Type(() => PropertyImageInput)
  images!: PropertyImageInput[];

  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => PropertyRoomInput)
  rooms!: PropertyRoomInput[];
}

export class UpdatePropertyDto {
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  slug?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(400)
  shortDescription?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(5000)
  description?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(160)
  location?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  area?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  propertyType?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  collection?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  bedrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  beds?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(50)
  bathrooms?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(50)
  maxGuests?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(1_000_000)
  pricePerNight?: number;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  imageAlt?: string;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(30)
  @IsString({ each: true })
  houseRules?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyImageInput)
  images?: PropertyImageInput[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyRoomInput)
  rooms?: PropertyRoomInput[];
}

export class ReplaceAmenitiesDto {
  @IsArray()
  @ArrayMaxSize(40)
  @IsString({ each: true })
  @MaxLength(80, { each: true })
  names!: string[];
}

export class CreateBlockDto {
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  note?: string;
}

export class AvailabilityQueryDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  from?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  to?: string;
}

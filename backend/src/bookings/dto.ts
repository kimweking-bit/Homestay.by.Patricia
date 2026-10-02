import { Transform, Type } from "class-transformer";
import { IsEmail, IsEnum, IsInt, IsOptional, IsString, Matches, Max, MaxLength, Min, MinLength } from "class-validator";
import { BookingStatus } from "@prisma/client";

export class CreateBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(80)
  propertyId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  propertySlug?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  checkIn!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  checkOut!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  guests!: number;

  @Transform(({ value }) => String(value ?? "").trim())
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName!: string;

  @Transform(({ value }) => String(value ?? "").trim())
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName!: string;

  @Transform(({ value }) => String(value ?? "").trim().toLowerCase())
  @IsEmail()
  email!: string;

  @Transform(({ value }) => String(value ?? "").trim())
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  phone!: string;

  @IsOptional()
  @Transform(({ value }) => (value === undefined || value === null ? undefined : String(value).trim()))
  @IsString()
  @MaxLength(2000)
  specialRequest?: string;
}

export class QuoteBookingDto {
  @IsOptional()
  @IsString()
  propertyId?: string;

  @IsOptional()
  @IsString()
  propertySlug?: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  checkIn!: string;

  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  checkOut!: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  guests!: number;
}

export class UpdateBookingDto {
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  checkIn?: string;

  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  checkOut?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  guests?: number;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  lastName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(40)
  phone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  specialRequest?: string;
}

export class CancelBookingDto {
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class UpdateBookingStatusDto {
  @IsEnum(BookingStatus)
  status!: BookingStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class BookingListQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  pageSize = 20;

  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;
}

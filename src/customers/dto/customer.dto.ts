import { PartialType } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateCustomerDto {
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @IsEmail()
  @MaxLength(255)
  email!: string;

  @IsString()
  @MinLength(1)
  @MaxLength(150)
  company!: string;

  @IsString()
  @MinLength(5)
  @MaxLength(30)
  contact!: string;
}

export class UpdateCustomerDto extends PartialType(
  CreateCustomerDto,
  { skipNullProperties: false },
) {}
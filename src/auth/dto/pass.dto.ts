import { Transform } from "class-transformer";
import { IsEmail, IsString, MinLength } from "class-validator";

export class PassDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  password: string;

  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  newPassword: string;
}

export class PassEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  password: string;

  @IsString()
  @MinLength(6)
  @Transform(({ value }) => value.trim())
  verPassword: string;
}

export class EmailDto {
  @IsEmail()
  email: string;
}

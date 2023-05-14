import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { JwtTokenPayload } from 'src/static/jwt-interface';
import { Request } from 'express';

export class FindOrCreateCustomerAndSendOtpForm {
  @ApiProperty({
    description: `Customer's country code for phone number`,
    example: '91',
    type: String,
  })
  @IsString()
  countryCode: string;

  @ApiProperty({
    description: `Customer's phone number`,
    example: '9898989898',
    type: String,
  })
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional({
    description: `Customer's name`,
    example: 'John Doe',
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;
}

export class ValidateOtpCustomerBodyForm {
  @ApiProperty({
    description: `Customer's phone number`,
    example: '9898989898',
    type: String,
  })
  @IsString()
  phoneNumber: string;
  @ApiProperty({
    description: `Customer's otp to continue`,
    example: '123456',
    type: String,
  })
  @IsString()
  otp: string;
}

export interface RequestWithJWTTokenPayloadAndToken extends Request {
  tokenPayload: JwtTokenPayload;
  token: string;
}

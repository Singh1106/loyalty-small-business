import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class FindOrCreateMerchantAndSendOtpForm {
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

export class ValidateOtpMerchantBodyForm {
  @ApiProperty({
    description: `Merchant's phone number`,
    example: '9898989898',
    type: String,
  })
  @IsString()
  phoneNumber: string;
  @ApiProperty({
    description: `Merchant's otp to continue`,
    example: '1W3R56',
    type: String,
  })
  @IsString()
  otp: string;
}

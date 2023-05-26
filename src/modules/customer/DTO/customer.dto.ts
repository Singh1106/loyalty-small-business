import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsNumber } from 'class-validator';
import { JwtTokenPayload } from 'src/static/jwt-interface';
import { Request } from 'express';
import { NonLoyaltyPaymentMethods } from 'src/static/enums';
import { Type } from 'class-transformer';

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

export class AmountBreakupLoyaltyForm {
  @ApiProperty({
    description: `Amount paid with loyalty rewards`,
    example: 43,
    type: Number,
  })
  @IsNumber()
  amount: number;
}
export class AmountBreakupNonLoyaltyForm {
  @ApiProperty({
    description: `Amount paid with non loyalty`,
    example: 43,
    type: Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: `Amount paid with non loyalty's payment method`,
    example: 'upi',
    enum: NonLoyaltyPaymentMethods,
  })
  @IsNumber()
  paymentMethod: NonLoyaltyPaymentMethods;
}
export class AmountBreakupForm {
  @ApiProperty({
    description: `Amount breakup's loyalty part`,
    type: AmountBreakupLoyaltyForm,
  })
  @Type(() => AmountBreakupLoyaltyForm)
  loyalty: AmountBreakupLoyaltyForm;
  @ApiProperty({
    description: `Amount breakup's non loyalty part`,
    type: AmountBreakupLoyaltyForm,
  })
  @Type(() => AmountBreakupNonLoyaltyForm)
  nonLoyalty: AmountBreakupNonLoyaltyForm;
}
export class ExecuteAddTransactionProcessBodyForm {
  @ApiProperty({
    description: `Business's Id with which customer is making txn with.`,
    example: '582ucbwid935u9db29dn20d',
    type: String,
  })
  @IsString()
  businessId: string;

  @ApiProperty({
    description: `Amount Breakup`,
    type: AmountBreakupForm,
  })
  @Type(() => AmountBreakupForm)
  amountBreakup: AmountBreakupForm;
}

export interface RequestWithJWTTokenPayloadAndToken extends Request {
  tokenPayload: JwtTokenPayload;
  token: string;
}

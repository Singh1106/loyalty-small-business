import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { MerchantService } from './merchant.service';
import {
  FindOrCreateMerchantAndSendOtpForm,
  ValidateOtpMerchantBodyForm,
} from './DTO/merchant.dto';
import { VerifyJWTAndFetchPayload } from 'src/interceptors/verify-jwt-and-fetch-payload';
import { JwtTokenPayload } from 'src/static/jwt-interface';
import { RequestWithJWTTokenPayloadAndToken } from '../customer/DTO/customer.dto';

@Controller('merchant')
export class MerchantController {
  constructor(private readonly merchantService: MerchantService) {}

  @Post('findOrCreateMerchantAndSendOtp')
  findOrCreateMerchantAndSendOtp(
    @Body() form: FindOrCreateMerchantAndSendOtpForm,
  ): Promise<{ status: string; msg: string }> {
    return this.merchantService.findOrCreateMerchantAndSendOtp(form);
  }
  @Post('validateOtpAndGenerateToken')
  validateOtpAndGenerateToken(
    @Body() form: ValidateOtpMerchantBodyForm,
  ): Promise<{ token: string }> {
    return this.merchantService.validateOtpAndGenerateToken(form);
  }

  @Get('fetchMyBusinesses')
  @UseInterceptors(VerifyJWTAndFetchPayload)
  async fetchMyBusinesses(@Req() request: RequestWithJWTTokenPayloadAndToken) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return await this.merchantService.fetchMyBusinesses(jwtTokenPayload.sub);
  }

  @Get('fetchTransactionsWithThisBusiness/:businessId')
  @UseInterceptors(VerifyJWTAndFetchPayload)
  async fetchTransactionsWithThisBusiness(
    @Req() request: RequestWithJWTTokenPayloadAndToken,
    @Param() params: any,
  ) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return await this.merchantService.fetchTransactionsWithThisBusiness(
      jwtTokenPayload.sub,
      params.businessId,
    );
  }

  @Get(`getMerchant`)
  @UseInterceptors(VerifyJWTAndFetchPayload)
  async getCustomer(@Req() request: RequestWithJWTTokenPayloadAndToken) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return await this.merchantService.findMerchantById(jwtTokenPayload.sub);
  }
}

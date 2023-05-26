import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  ExecuteAddTransactionProcessBodyForm,
  FindOrCreateCustomerAndSendOtpForm,
  RequestWithJWTTokenPayloadAndToken,
  ValidateOtpCustomerBodyForm,
} from './DTO/customer.dto';
import { VerifyJWTAndFetchPayload } from 'src/interceptors/verify-jwt-and-fetch-payload';
import { JwtTokenPayload } from 'src/static/jwt-interface';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('findOrCreateCustomerAndSendOtp')
  findOrCreateCustomerAndSendOtp(
    @Body() form: FindOrCreateCustomerAndSendOtpForm,
  ): Promise<{ status: string; msg: string }> {
    return this.customerService.findOrCreateCustomerAndSendOtp(form);
  }
  @Post('validateOtpAndGenerateToken')
  validateOtpAndGenerateToken(
    @Body() form: ValidateOtpCustomerBodyForm,
  ): Promise<{ token: string }> {
    return this.customerService.validateOtpAndGenerateToken(form);
  }

  @Get('fetchBusinessesIHaveTransactedWith')
  @UseInterceptors(VerifyJWTAndFetchPayload)
  async fetchBusinessesIHaveTransactedWith(
    @Req() request: RequestWithJWTTokenPayloadAndToken,
  ) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return await this.customerService.fetchBusinessesIHaveTransactedWith(
      jwtTokenPayload.sub,
    );
  }

  @Get(`fetchTransactionsWithThisBusiness/:businessId`)
  @UseInterceptors(VerifyJWTAndFetchPayload)
  async fetchTransactionsWithThisBusiness(
    @Req() request: RequestWithJWTTokenPayloadAndToken,
    @Param() params: any,
  ) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return await this.customerService.fetchTransactionsWithThisBusiness(
      jwtTokenPayload.sub,
      params.businessId,
    );
  }
  @Get(`logout`)
  @UseInterceptors(VerifyJWTAndFetchPayload)
  async logout(@Req() request: RequestWithJWTTokenPayloadAndToken) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return await this.customerService.logout(
      jwtTokenPayload.sub,
      request.token,
    );
  }

  @Get(`getCustomer`)
  @UseInterceptors(VerifyJWTAndFetchPayload)
  async getCustomer(@Req() request: RequestWithJWTTokenPayloadAndToken) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return await this.customerService.findCustomerById(jwtTokenPayload.sub);
  }

  @Post(`executeAddTransactionProcess`)
  @UseInterceptors(VerifyJWTAndFetchPayload)
  async executeAddTransactionProcess(
    @Req() request: RequestWithJWTTokenPayloadAndToken,
    @Body() form: ExecuteAddTransactionProcessBodyForm,
  ) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return await this.customerService.executeAddTransactionProcess(
      form,
      jwtTokenPayload.sub,
    );
  }
}

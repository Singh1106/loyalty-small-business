import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseInterceptors,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  ContinueCustomerBodyForm,
  RequestWithJWTTokenPayload,
  ValidateOtpCustomerBodyForm,
} from './DTO/customer.dto';
import { VerifyJWTAndFetchPayload } from 'src/interceptors/verify-jwt-and-fetch-payload';
import { JwtTokenPayload } from 'src/static/jwt-interface';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('findOrCreateCustomerAndSendOtp')
  findOrCreateCustomerAndSendOtp(
    @Body() form: ContinueCustomerBodyForm,
  ): Promise<{ status: string; msg: string }> {
    return this.customerService.findOrCreateCustomerAndSendOtp(form);
  }
  @Post('validateOtpAndGenerateToken')
  validateOtpAndGenerateToken(
    @Body() form: ValidateOtpCustomerBodyForm,
  ): Promise<{ token: string }> {
    return this.customerService.validateOtpAndGenerateToken(form);
  }
  @Post('protectedRoute')
  @UseInterceptors(VerifyJWTAndFetchPayload)
  protectedRoute(@Req() request: RequestWithJWTTokenPayload) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return `ProtectedRoute, user: ${jwtTokenPayload.sub}`;
  }

  @Get('fetchBusinessesIHaveTransactedWith')
  @UseInterceptors(VerifyJWTAndFetchPayload)
  async fetchBusinessesIHaveTransactedWith(
    @Req() request: RequestWithJWTTokenPayload,
  ) {
    const jwtTokenPayload: JwtTokenPayload = request.tokenPayload;
    return await this.customerService.fetchBusinessesIHaveTransactedWith(
      jwtTokenPayload.sub,
    );
  }
}

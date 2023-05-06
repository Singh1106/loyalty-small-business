import { Body, Controller, Post } from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  ContinueCustomerBodyForm,
  ValidateOtpCustomerBodyForm,
} from './DTO/customer.dto';

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
}

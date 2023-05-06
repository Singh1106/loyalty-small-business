import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import {
  ContinueCustomerBodyForm,
  ValidateOtpCustomerBodyForm,
} from './DTO/customer.dto';
import { JwtAuthGuard } from 'src/guards/jwt-guard';

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
  @Post()
  @UseGuards(JwtAuthGuard)
  protectedRoute() {
    return { message: 'This route is protected' };
  }
}

import { Controller, Get } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Customer } from 'src/schemas/customer.schema';

@Controller('customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Get('continue')
  getHello(): Promise<Customer> {
    return this.customerService.continue();
  }
}

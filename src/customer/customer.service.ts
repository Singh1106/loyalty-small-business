import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from 'src/schemas/customer.schema';
import { to } from 'await-to-js';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<Customer>,
  ) {}

  async continue(): Promise<Customer> {
    const createdCustomer = new this.customerModel({
      phoneNumber: '9899096444',
      countryCode: '91',
    });
    const [createCustomerError, createCustomerResult] = await to(
      createdCustomer.save(),
    );
    if (createCustomerError) {
      throw new HttpException(
        `Failed to create customer: ${createCustomerError.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    return createCustomerResult;
  }
}

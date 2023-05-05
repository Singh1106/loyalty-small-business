import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from 'src/schemas/customer.schema';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel(Customer.name) private customerModel: Model<Customer>,
  ) {}

  continue(): Promise<Customer> {
    const createdCustomer = new this.customerModel({
      name: 'customer1',
      age: 21,
      breed: 'IDK what this is',
    });
    return createdCustomer.save();
  }
}

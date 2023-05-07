import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from 'src/schemas/customer.schema';
import {
  ContinueCustomerBodyForm,
  ValidateOtpCustomerBodyForm,
} from './DTO/customer.dto';
import { Otp } from 'src/schemas/otp.schema';
import { UserTypes } from 'src/static/enums';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import to from 'await-to-js';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<Customer>,
    @InjectModel('Otp') private otpModel: Model<Otp>,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async findOrCreateCustomerAndSendOtp(
    form: ContinueCustomerBodyForm,
  ): Promise<{ status: string; msg: string }> {
    const [err, customer] = await to(this.findOrCreateCustomer(form));

    if (err) {
      throw new HttpException(
        `Failed to create or find customer: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const [otpErr, otp] = await to(this.generateAndSaveOtp(customer));

    if (otpErr) {
      throw new HttpException(
        `Failed to create or save otp: ${otpErr.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const [sendOtpErr] = await to(
      this.sendOtpToEmail('jswork98@gmail.com', otp.otp),
    );
    // todo: use sendOtpToPhone instead.

    if (sendOtpErr) {
      throw new HttpException(
        `Failed to send otp to customer: ${sendOtpErr.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 'success',
      msg: 'Customer exists Successfully, sent otp',
    };
  }

  async findCustomerByPhoneNumber(
    phoneNumber: string,
  ): Promise<Customer | null> {
    const [error, existingCustomer] = await to(
      this.customerModel.findOne({ phoneNumber }),
    );
    if (error) {
      throw new Error(
        `Error finding customer by phone number: ${error.message}`,
      );
    }
    return existingCustomer;
  }

  async createCustomer(form: ContinueCustomerBodyForm): Promise<Customer> {
    const newCustomer = new this.customerModel(form);
    const [error, createdCustomer] = await to(newCustomer.save());
    if (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
    return createdCustomer;
  }

  async findOrCreateCustomer(
    form: ContinueCustomerBodyForm,
  ): Promise<Customer> {
    const existingCustomer = await this.findCustomerByPhoneNumber(
      form.phoneNumber,
    );
    if (existingCustomer) {
      return existingCustomer;
    }
    const createdCustomer = await this.createCustomer(form);
    return createdCustomer;
  }

  async generateAndSaveOtp(customer: Customer): Promise<Otp> {
    const otp = this.commonUtilsService.generateOtp(6);
    const now = new Date();
    const expiryTime = new Date(
      now.getTime() + Number(process.env.OTP_TIME_OUT) * 60 * 1000,
    );
    const createdOtp = new this.otpModel({
      otp,
      userType: UserTypes.customer,
      refId: customer._id,
      expiry: expiryTime,
    });
    const savedOtp = await createdOtp.save();
    return savedOtp;
  }

  async sendOtpToEmail(email: string, otp: string): Promise<void> {
    this.commonUtilsService.sendOtpToMail(email, otp);
  }

  async validateOtpAndGenerateToken(
    form: ValidateOtpCustomerBodyForm,
  ): Promise<{ token: string }> {
    const customer = await this.customerModel.findOne({
      phoneNumber: form.phoneNumber,
    });
    if (!customer) {
      throw new HttpException(
        `Failed to find customer with phoneNumber ${form.phoneNumber}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const latestOtp = await this.otpModel
      .findOne({ refId: customer._id })
      .sort({ createdAt: -1 });
    if (!latestOtp) {
      throw new HttpException(
        'Otp not found.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    if (
      !this.commonUtilsService.validateOtp(
        latestOtp.otp,
        latestOtp.expiry,
        form.otp,
      )
    ) {
      throw new HttpException(
        'Otp not correct or expired. Please try again.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const token = this.jwtAuthService.generateJWT(customer);
    customer.tokens.push(token);
    await customer.save();

    return { token };
  }
}

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from 'src/schemas/customer.schema';
import { to } from 'await-to-js';
import {
  ContinueCustomerBodyForm,
  ValidateOtpCustomerBodyForm,
} from './DTO/customer.dto';
import { Otp } from 'src/schemas/otp.schema';
import { UserTypes } from 'src/static/enums';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';

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
    try {
      const customer = await this.findOrCreateCustomer(form);
      const otp = await this.generateAndSaveOtp(customer);
      await this.sendOtpToEmail('jswork98@gmail.com', otp.otp);
      return {
        status: 'success',
        msg: 'Customer exists Successfully, sent otp',
      };
    } catch (error) {
      throw new HttpException(
        `Failed to create or send otp to customer: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }
  async findOrCreateCustomer(
    form: ContinueCustomerBodyForm,
  ): Promise<Customer> {
    const existingCustomer = await this.customerModel.findOne({
      phoneNumber: form.phoneNumber,
    });
    if (existingCustomer) {
      return existingCustomer;
    }
    const newCustomer = new this.customerModel(form);
    const createdCustomer = await newCustomer.save();
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
    const customer = await this.customerModel
      .findOne({ phoneNumber: form.phoneNumber })
      .exec();
    if (!customer) {
      throw new HttpException(
        `Failed to find customer with phoneNumber ${form.phoneNumber}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const latestOtp = await this.otpModel
      .findOne({ refId: customer._id })
      .sort({ createdAt: -1 })
      .exec();
    if (!latestOtp) {
      throw new HttpException(
        'Otp not found.',
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const isOtpValid = this.commonUtilsService.validateOtp(
      latestOtp.otp,
      latestOtp.expiry,
      form.otp,
    );
    if (!isOtpValid) {
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

import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from 'src/schemas/customer.schema';
import { to } from 'await-to-js';
import {
  ContinueCustomerBodyForm,
  ValidateOtpCustomerBodyForm,
} from './DTO/customer.dto';
import {
  generateJWT,
  generateOtp,
  sendOtpToMail,
  validateOtp,
} from 'src/utils/commonUtils';
import { Otp } from 'src/schemas/otp.schema';
import { UserTypes } from 'src/static/enums';

@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<Customer>,
    @InjectModel('Otp') private otpModel: Model<Otp>,
  ) {}

  async continue(
    form: ContinueCustomerBodyForm,
  ): Promise<{ status: string; msg: string }> {
    const createdCustomer = new this.customerModel(form);
    const [createCustomerError, createCustomerResult] = await to(
      createdCustomer.save(),
    );
    if (createCustomerError) {
      throw new HttpException(
        `Failed to create customer: ${createCustomerError.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
    const otp = generateOtp(6);
    const now = new Date();
    const expiryTime = new Date(
      now.getTime() + Number(process.env.OTP_TIME_OUT) * 60 * 1000,
    );
    const expiryTimeEpochTime = Math.floor(expiryTime.getTime() / 1000);
    const createdOtp = new this.otpModel({
      otp,
      userType: UserTypes.customer,
      refId: createCustomerResult._id,
      expiry: expiryTimeEpochTime,
    });
    const [createOtpForCustomerError] = await to(createdOtp.save());
    if (createOtpForCustomerError) {
      throw new HttpException(
        `We could not send otp, please try again. ${createOtpForCustomerError.message}`,
        HttpStatus.BAD_GATEWAY,
      );
    }
    sendOtpToMail('jswork@gmail.com', otp);
    // todo: update to sendOtpToPhone after configuring twilio

    return {
      status: 'success',
      msg: 'Customer generated Successfully, sent otp',
    };
  }

  async validateOtp(
    form: ValidateOtpCustomerBodyForm,
    userId: string,
  ): Promise<{ token: string }> {
    const [findCustomerError, findCustomerResult] = await to(
      this.customerModel.findById(userId),
    );
    if (findCustomerError) {
      throw new HttpException(
        `Failed to find customer: ${findCustomerError.message}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const [findOtpError, findOtpResult] = await to(
      this.otpModel.findOneAndDelete({ refId: userId }),
    );
    if (findOtpError) {
      throw new HttpException(
        `Otp not found.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const isOtpValid = validateOtp(
      findOtpResult.otp,
      findOtpResult.expiry,
      form.otp,
    );
    if (!isOtpValid) {
      throw new HttpException('Otp not correct', HttpStatus.BAD_REQUEST);
    }
    const token = generateJWT({ customerId: userId }, `14d`);
    findCustomerResult.tokens.push(token);

    const [updateCustomerError] = await to(findCustomerResult.save());
    if (updateCustomerError) {
      throw new HttpException(
        `Failed to update customer with token: ${updateCustomerError.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return { token };
  }
}

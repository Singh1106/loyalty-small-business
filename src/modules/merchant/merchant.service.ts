import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import to from 'await-to-js';
import { Model } from 'mongoose';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { Business } from 'src/schemas/business.schema';
import { Otp } from 'src/schemas/otp.schema';
import { Transaction } from 'src/schemas/transactions.schema';
import { UserTypes } from 'src/static/enums';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import {
  FindOrCreateMerchantAndSendOtpForm,
  ValidateOtpMerchantBodyForm,
} from './DTO/merchant.dto';
import { Merchant } from 'src/schemas/merchant.schema';

@Injectable()
export class MerchantService {
  constructor(
    @InjectModel('Otp') private otpModel: Model<Otp>,
    @InjectModel('Transaction') private transactionModel: Model<Transaction>,
    @InjectModel('Business') private businessModel: Model<Business>,
    @InjectModel('Merchant') private merchantModel: Model<Merchant>,

    private readonly commonUtilsService: CommonUtilsService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}
  async findOrCreateMerchantAndSendOtp(
    form: FindOrCreateMerchantAndSendOtpForm,
  ): Promise<{ status: string; msg: string }> {
    const [err, merchant] = await to(this.findOrCreateMerchant(form));

    if (err) {
      throw new HttpException(
        `Failed to create or find merchant: ${err.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    const [otpErr, otp] = await to(this.generateAndSaveOtp(merchant));

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
        `Failed to send otp to merchant: ${sendOtpErr.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }

    return {
      status: 'success',
      msg: 'Merchant exists Successfully, sent otp',
    };
  }

  async findOrCreateMerchant(
    form: FindOrCreateMerchantAndSendOtpForm,
  ): Promise<Merchant> {
    const existingMerchant = await this.findMerchantByPhoneNumber(
      form.phoneNumber,
    );
    if (existingMerchant) {
      return existingMerchant;
    }
    const createdMerchant = await this.createMerchant(form);
    return createdMerchant;
  }

  async findMerchantByPhoneNumber(
    phoneNumber: string,
  ): Promise<Merchant | null> {
    const [error, existingMerchant] = await to(
      this.merchantModel.findOne({ phoneNumber }),
    );
    if (error) {
      throw new Error(
        `Error finding merchant by phone number: ${error.message}`,
      );
    }
    return existingMerchant;
  }

  async createMerchant(
    form: FindOrCreateMerchantAndSendOtpForm,
  ): Promise<Merchant> {
    const newMerchant = new this.merchantModel(form);
    const [error, createdMerchant] = await to(newMerchant.save());
    if (error) {
      throw new Error(`Error creating merchant: ${error.message}`);
    }
    return createdMerchant;
  }

  async generateAndSaveOtp(merchant: Merchant): Promise<Otp> {
    const otp = this.commonUtilsService.generateOtp(6);
    const now = new Date();
    const expiryTime = new Date(
      now.getTime() + Number(process.env.OTP_TIME_OUT) * 60 * 1000,
    );
    const createdOtp = new this.otpModel({
      otp,
      userType: UserTypes.customer,
      refId: merchant._id,
      expiry: expiryTime,
    });
    const savedOtp = await createdOtp.save();
    return savedOtp;
  }

  async sendOtpToEmail(email: string, otp: string): Promise<void> {
    this.commonUtilsService.sendOtpToMail(email, otp);
  }
  async validateOtpAndGenerateToken(
    form: ValidateOtpMerchantBodyForm,
  ): Promise<{ token: string; merchant: Merchant }> {
    const merchant = await this.merchantModel.findOne({
      phoneNumber: form.phoneNumber,
    });
    if (!merchant) {
      throw new HttpException(
        `Failed to find merchant with phoneNumber ${form.phoneNumber}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }

    const latestOtp = await this.otpModel
      .findOne({ refId: merchant._id })
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

    const token = this.jwtAuthService.generateJWT(merchant);
    merchant.tokens.push(token);
    await merchant.save();

    return { token, merchant };
    // return customer in customer controller as well.
  }

  async fetchMyBusinesses(merchantId: string): Promise<Business[]> {
    return await this.businessModel.find({ merchant: merchantId });
  }

  async fetchTransactionsWithThisBusiness(
    merchantId: string,
    businessId: string,
  ): Promise<Transaction[]> {
    return await this.transactionModel.find({
      business: businessId,
    });
  }

  async findMerchantById(id: string): Promise<Merchant | null> {
    const [error, existingMerchant] = await to(this.merchantModel.findById(id));
    if (error) {
      throw new HttpException(
        `Error finding merchant by id: ${error.message}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (!existingMerchant) {
      throw new HttpException(
        `Merchant with this id: ${id} does not exist.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return existingMerchant;
  }
}

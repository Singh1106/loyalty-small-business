import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose, { Model } from 'mongoose';
import { Customer } from 'src/schemas/customer.schema';
import {
  AmountBreakupForm,
  ExecuteAddTransactionProcessBodyForm,
  FindOrCreateCustomerAndSendOtpForm,
  ValidateOtpCustomerBodyForm,
} from './DTO/customer.dto';
import { Otp } from 'src/schemas/otp.schema';
import { UserTypes } from 'src/static/enums';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import to from 'await-to-js';
import { Transaction } from 'src/schemas/transactions.schema';
import { Business } from 'src/schemas/business.schema';
@Injectable()
export class CustomerService {
  constructor(
    @InjectModel('Customer') private customerModel: Model<Customer>,
    @InjectModel('Otp') private otpModel: Model<Otp>,
    @InjectModel('Transaction') private transactionModel: Model<Transaction>,
    @InjectModel('Business') private businessModel: Model<Business>,
    private readonly commonUtilsService: CommonUtilsService,
    private readonly jwtAuthService: JwtAuthService,
  ) {}

  async findOrCreateCustomerAndSendOtp(
    form: FindOrCreateCustomerAndSendOtpForm,
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

  async findOrCreateCustomer(
    form: FindOrCreateCustomerAndSendOtpForm,
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

  async createCustomer(
    form: FindOrCreateCustomerAndSendOtpForm,
  ): Promise<Customer> {
    const newCustomer = new this.customerModel(form);
    const [error, createdCustomer] = await to(newCustomer.save());
    if (error) {
      throw new Error(`Error creating customer: ${error.message}`);
    }
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

    // todo: update the otp's status to expired.

    const token = this.jwtAuthService.generateJWT(customer);
    customer.tokens.push(token);
    await customer.save();

    return { token };
  }

  async fetchBusinessesIHaveTransactedWith(
    userId: string,
  ): Promise<{ name: string; _id: string }[]> {
    const [fetchTransactionsError, fetchTransactionsResult] = await to(
      this.transactionModel.find({ customer: userId }),
    );
    if (fetchTransactionsError) {
      throw new HttpException(
        `Error in fetching transactions. ${fetchTransactionsError.message}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    const uniqueBusinessesIds = new Set<mongoose.Types.ObjectId>();

    for (const transaction of fetchTransactionsResult) {
      uniqueBusinessesIds.add(
        new mongoose.Types.ObjectId(transaction.business.toString()),
      );
    }
    const uniqueBusinessesIdsArray = [...uniqueBusinessesIds]; // set is not an array.

    const businesses = await this.businessModel.find({
      _id: { $in: uniqueBusinessesIdsArray },
    });
    const uniqueBusinesses = businesses.map((business) => {
      return {
        name: business.name,
        _id: business._id,
      };
    });
    return uniqueBusinesses;
  }

  async fetchTransactionsWithThisBusiness(
    userId: string,
    businessId: string,
  ): Promise<Transaction[]> {
    return await this.transactionModel.find({
      customer: userId,
      business: businessId,
    });
  }

  async logout(customerId: string, token: string) {
    const existingCustomer = await this.customerModel.findById(customerId);
    existingCustomer.tokens = existingCustomer.tokens.filter(
      (customerToken) => customerToken !== token,
    );
    await existingCustomer.save();
    return { success: true, msg: 'User has successfully logged out.' };
  }

  async findCustomerById(id: string): Promise<Customer | null> {
    const [error, existingCustomer] = await to(this.customerModel.findById(id));
    if (error) {
      throw new HttpException(
        `Error finding customer by id: ${error.message}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (!existingCustomer) {
      throw new HttpException(
        `Customer with this id: ${id} does not exist.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return existingCustomer;
  }

  async findBusinessById(id: string): Promise<Business | null> {
    const [error, existingBusiness] = await to(this.businessModel.findById(id));
    if (error) {
      throw new HttpException(
        `Error finding Business by id: ${error.message}`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    if (!existingBusiness) {
      throw new HttpException(
        `Business with this id: ${id} does not exist.`,
        HttpStatus.UNPROCESSABLE_ENTITY,
      );
    }
    return existingBusiness;
  }

  getEarningForThisTransaction(
    amountBreakup: AmountBreakupForm,
    earningPercentageForThisBusiness: number,
  ): number {
    if (amountBreakup?.nonLoyalty) {
      return (
        (amountBreakup?.nonLoyalty?.amount * earningPercentageForThisBusiness) /
        100
      );
    }
    return 0;
  }

  async createTransaction(form): Promise<Transaction> {
    const newTransaction = new this.transactionModel(form);
    const [error, createdTransaction] = await to(newTransaction.save());
    if (error) {
      throw new HttpException(
        `Error creating transaction: ${error.message}`,
        HttpStatus.CONFLICT,
      );
    }
    // todo: Make jobs for this.
    return createdTransaction;
  }

  getTotalAmountFromAmountBreakup(amountBreakup: AmountBreakupForm): number {
    let totalAmount = 0;
    if (amountBreakup?.nonLoyalty) {
      totalAmount += amountBreakup?.nonLoyalty?.amount;
    }
    if (amountBreakup?.loyalty) {
      totalAmount += amountBreakup?.loyalty?.amount;
    }
    return totalAmount;
  }

  async executeAddTransactionProcess(
    form: ExecuteAddTransactionProcessBodyForm,
    id: string,
  ): Promise<Transaction | null> {
    const existingCustomer = await this.findCustomerById(id);
    const existingBusiness = await this.findBusinessById(form.businessId);
    const earningPercentageForThisBusiness = existingBusiness.earningPercentage;
    const earningForThisTransaction = this.getEarningForThisTransaction(
      form.amountBreakup,
      earningPercentageForThisBusiness,
    );
    const payloadForThisTransaction = {
      business: form.businessId,
      customer: id,
      amountBreakup: form.amountBreakup,
      totalAmount: this.getTotalAmountFromAmountBreakup(form?.amountBreakup),
      earning: earningForThisTransaction,
    };
    const createdTransaction = await this.createTransaction(
      payloadForThisTransaction,
    );

    let firstTransactionOfThisUserWithThisBusiness = true;
    existingCustomer.businessesEarning = existingCustomer.businessesEarning.map(
      (earningPerBusiness) => {
        if (earningPerBusiness.id === form.businessId) {
          earningPerBusiness.loyalty = Number(
            (
              earningPerBusiness.loyalty +
              earningForThisTransaction -
              form?.amountBreakup?.loyalty?.amount
            ).toFixed(0),
          );
          firstTransactionOfThisUserWithThisBusiness = false;
        }
        return earningPerBusiness;
      },
    );
    if (firstTransactionOfThisUserWithThisBusiness) {
      existingCustomer.businessesEarning.push({
        id: form.businessId,
        loyalty: earningForThisTransaction,
      });
    }
    existingCustomer.save();
    return createdTransaction;
  }
}

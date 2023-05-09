import { Module } from '@nestjs/common';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { CustomerSchema } from 'src/schemas/customer.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { OtpSchema } from 'src/schemas/otp.schema';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { JwtAuthModule } from '../jwt-auth/jwt-auth.module';
import { TransactionSchema } from 'src/schemas/transactions.schema';
import { BusinessSchema } from 'src/schemas/business.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Customer', schema: CustomerSchema },
      { name: 'Otp', schema: OtpSchema },
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'Business', schema: BusinessSchema },
    ]),
    JwtAuthModule,
  ],
  controllers: [CustomerController],
  providers: [CustomerService, CommonUtilsService, JwtAuthService],
})
export class CustomerModule {}

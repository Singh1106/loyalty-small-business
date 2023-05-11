import { Module } from '@nestjs/common';
import { MerchantController } from './merchant.controller';
import { MerchantService } from './merchant.service';
import { MongooseModule } from '@nestjs/mongoose';
import { BusinessSchema } from 'src/schemas/business.schema';
import { OtpSchema } from 'src/schemas/otp.schema';
import { TransactionSchema } from 'src/schemas/transactions.schema';
import { JwtAuthModule } from '../jwt-auth/jwt-auth.module';
import { CommonUtilsService } from 'src/common-utils/common-utils.service';
import { JwtAuthService } from '../jwt-auth/jwt-auth.service';
import { MerchantSchema } from 'src/schemas/merchant.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: 'Otp', schema: OtpSchema },
      { name: 'Transaction', schema: TransactionSchema },
      { name: 'Business', schema: BusinessSchema },
      { name: 'Merchant', schema: MerchantSchema },
    ]),
    JwtAuthModule,
  ],
  controllers: [MerchantController],
  providers: [MerchantService, CommonUtilsService, JwtAuthService],
})
export class MerchantModule {}

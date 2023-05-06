import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from './customer/customer.module';
import { BusinessModule } from './business/business.module';
import { MerchantModule } from './merchant/merchant.module';
import { TransactionModule } from './transaction/transaction.module';
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'dev.env' }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    CustomerModule,
    BusinessModule,
    MerchantModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

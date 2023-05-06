import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from './customer/customer.module';
import { BusinessModule } from './business/business.module';
import { MerchantModule } from './merchant/merchant.module';
import { TransactionModule } from './transaction/transaction.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CommonUtilsService } from './common-utils/common-utils.service';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: 'dev.env' }),
    MongooseModule.forRoot(process.env.MONGO_URI),
    MailerModule.forRoot({
      transport: `smtps://${process.env.SENDER_MAIL}:${process.env.SENDER_PASSWORD}@smtp.gmail.com`,
      defaults: {
        from: '"nest-modules" <modules@nestjs.com>',
      },
    }),
    CustomerModule,
    BusinessModule,
    MerchantModule,
    TransactionModule,
  ],
  controllers: [AppController],
  providers: [AppService, CommonUtilsService],
})
export class AppModule {}

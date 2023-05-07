import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerModule } from './modules/customer/customer.module';
import { BusinessModule } from './modules/business/business.module';
import { MerchantModule } from './modules/merchant/merchant.module';
import { TransactionModule } from './modules/transaction/transaction.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { CommonUtilsService } from './common-utils/common-utils.service';
import { JwtAuthModule } from './modules/jwt-auth/jwt-auth.module';
import { DevtoolsModule } from '@nestjs/devtools-integration';
import { LoggingMiddleware } from './middlewares/logging';
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
    DevtoolsModule.register({
      http: process.env.NODE_ENV !== 'production',
    }),
    CustomerModule,
    BusinessModule,
    MerchantModule,
    TransactionModule,
    JwtAuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, CommonUtilsService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggingMiddleware).forRoutes('*');
  }
}

import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { JwtAuthService } from './jwt-auth.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: process.env.JWT_SECRET,
        signOptions: { expiresIn: '14d' },
      }),
    }),
  ],
  providers: [JwtAuthService],
  exports: [JwtModule],
})
export class JwtAuthModule {}

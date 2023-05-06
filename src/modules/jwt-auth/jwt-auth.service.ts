import { Injectable } from '@nestjs/common';
import { Customer } from 'src/schemas/customer.schema';
import { Merchant } from 'src/schemas/merchant.schema';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}
  generateJWT(user: Customer | Merchant): string {
    const payload = { sub: user._id };
    const token = this.jwtService.sign(payload);
    return token;
  }
}

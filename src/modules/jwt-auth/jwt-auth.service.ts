import { Customer } from 'src/schemas/customer.schema';
import { Merchant } from 'src/schemas/merchant.schema';

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class JwtAuthService {
  constructor(private readonly jwtService: JwtService) {}

  generateJWT(user: Customer | Merchant): string {
    const payload = { sub: user._id };
    const token = this.jwtService.sign(payload);
    return token;
  }

  async verifyJWT(token: string): Promise<any> {
    try {
      const payload = await this.jwtService.verifyAsync(token);
      return payload;
    } catch (error) {
      console.log(error);
      throw new Error('Invalid JWT token');
    }
  }
}

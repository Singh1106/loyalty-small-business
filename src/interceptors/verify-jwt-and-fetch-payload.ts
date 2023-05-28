import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import to from 'await-to-js';
import { JwtAuthService } from 'src/modules/jwt-auth/jwt-auth.service';

@Injectable()
export class VerifyJWTAndFetchPayload implements NestInterceptor {
  constructor(private readonly jwtAuthService: JwtAuthService) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    if (!authorization) {
      throw new HttpException(
        'Please provide bearer token',
        HttpStatus.UNAUTHORIZED,
      );
    }
    const [error, tokenPayload] = await to(
      this.jwtAuthService.verifyJWT(authorization.split(' ')[1]),
    );
    if (error || !tokenPayload) {
      throw new HttpException('Bearer token invalid', HttpStatus.UNAUTHORIZED);
    }
    request.tokenPayload = tokenPayload;
    request.token = authorization.split(' ')[1];
    return next.handle();
  }
}

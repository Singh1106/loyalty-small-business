import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { JwtAuthService } from 'src/modules/jwt-auth/jwt-auth.service';

@Injectable()
export class VerifyJWTAndFetchPayload implements NestInterceptor {
  constructor(private readonly jwtAuthService: JwtAuthService) {}
  async intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();
    const authorization = request.headers.authorization;
    const tokenPayload = await this.jwtAuthService.verifyJWT(
      authorization.split(' ')[1],
    );
    request.tokenPayload = tokenPayload;
    return next.handle();
  }
}

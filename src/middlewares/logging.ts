import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    console.log(
      `Incoming Request: ${req.method} ${req.originalUrl}\n` +
        `Headers: ${JSON.stringify(req.headers, null, 2)}\n` +
        `Body: ${JSON.stringify(req.body, null, 2)}`,
    );

    const oldSend = res.send;
    res.send = function (...args: any[]): Response {
      console.log('Outgoing Response:', args[0]);
      return oldSend.apply(res, args) as Response;
    };

    next();
  }
}

import {
  Injectable,
  NestMiddleware,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

import { AuthHelper } from '../helpers/auth.helper';

@Injectable()
export class RefreshTokenMiddleware implements NestMiddleware {
  constructor(private readonly authHelper: AuthHelper) {}

  use(req: Request, res: Response, next: NextFunction): void {
    const refreshToken = req?.headers['refresh-token'] as string;
    if (!refreshToken) throw new UnauthorizedException();

    const payload = this.authHelper.verifyToken(refreshToken);
    if (!payload) throw new UnauthorizedException();

    delete payload.iat;
    delete payload.exp;

    req.body = payload;

    next();
  }
}

import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

import { AuthHelper } from '../helpers/auth.helper';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authHelper: AuthHelper) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();

    const token = this.authHelper.extractToken(request);
    if (!token) throw new UnauthorizedException();

    const checked = this.authHelper.verifyToken(token);
    if (!checked) throw new UnauthorizedException();

    return true;
  }
}

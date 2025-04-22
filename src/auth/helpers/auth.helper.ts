import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import * as bcrypt from 'bcrypt';

import { IJwtPayload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class AuthHelper {
  constructor(private readonly jwtService: JwtService) {}

  async hash(password: string): Promise<string> {
    return await bcrypt.hash(password, 10);
  }

  async compare(password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }

  signAuthToken(payload: IJwtPayload): string {
    return this.jwtService.sign(payload);
  }

  signRefreshToken(payload: IJwtPayload): string {
    return this.jwtService.sign(payload, { expiresIn: '7d' });
  }

  verifyToken(token: string): IJwtPayload {
    try {
      return this.jwtService.verify(token);
    } catch {
      throw new UnauthorizedException();
    }
  }

  extractToken(request: Request): string | undefined {
    const authHeader = request.headers?.authorization;
    const [key, token] = authHeader?.split(' ') ?? [];
    return key === 'Bearer' ? token : undefined;
  }
}

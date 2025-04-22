import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { Types } from 'mongoose';

import { AuthHelper } from './auth.helper';
import { IJwtPayload } from '../interfaces/jwt-payload.interface';

const mockJwtService = {
  sign: jest.fn(),
  verify: jest.fn(),
};

describe('AuthHelper', () => {
  let authHelper: AuthHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthHelper,
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authHelper = module.get<AuthHelper>(AuthHelper);
  });

  it('should hash and compare passwords correctly', async () => {
    const password = 'mySecret123';

    const hash = await authHelper.hash(password);

    expect(typeof hash).toBe('string');
    expect(hash).not.toBe(password);
    expect(await authHelper.compare(password, hash)).toBe(true);
    expect(await authHelper.compare('wrongPassword', hash)).toBe(false);
  });

  it('should sign access token with correct payload', () => {
    const payload: IJwtPayload = {
      sub: new Types.ObjectId(),
      email: 'user@example.com',
    };

    mockJwtService.sign.mockReturnValue('access-token');

    const token = authHelper.signAuthToken(payload);

    expect(token).toBe('access-token');
    expect(mockJwtService.sign).toHaveBeenCalledWith(payload);
  });

  it('should sign refresh token with 7d expiration', () => {
    const payload: IJwtPayload = {
      sub: new Types.ObjectId(),
      email: 'user@example.com',
    };

    mockJwtService.sign.mockReturnValue('refresh-token');

    const token = authHelper.signRefreshToken(payload);

    expect(token).toBe('refresh-token');
    expect(mockJwtService.sign).toHaveBeenCalledWith(payload, {
      expiresIn: '7d',
    });
  });

  it('should verify token and return payload', () => {
    const payload: IJwtPayload = {
      sub: new Types.ObjectId(),
      email: 'test@example.com',
    };

    mockJwtService.verify.mockReturnValue(payload);

    const result = authHelper.verifyToken('valid-token');

    expect(result).toEqual(payload);
    expect(mockJwtService.verify).toHaveBeenCalledWith('valid-token');
  });

  it('should throw UnauthorizedException for invalid token', () => {
    mockJwtService.verify.mockImplementation(() => {
      throw new Error('invalid token');
    });

    expect(() => authHelper.verifyToken('invalid-token')).toThrow(
      UnauthorizedException,
    );
  });

  it('should extract token from Bearer header', () => {
    const req = {
      headers: {
        authorization: 'Bearer test-token',
      },
    } as unknown as Request;

    expect(authHelper.extractToken(req)).toBe('test-token');
  });

  it('should return undefined if token is missing or invalid format', () => {
    const req1 = {
      headers: { authorization: 'Token abc' },
    } as unknown as Request;
    const req2 = { headers: {} } as unknown as Request;
    const req3 = {} as unknown as Request;

    expect(authHelper.extractToken(req1)).toBeUndefined();
    expect(authHelper.extractToken(req2)).toBeUndefined();
    expect(authHelper.extractToken(req3)).toBeUndefined();
  });
});

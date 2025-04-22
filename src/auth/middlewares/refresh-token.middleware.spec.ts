import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';
import { Types } from 'mongoose';

import { RefreshTokenMiddleware } from './refresh-token.middleware';
import { AuthHelper } from '../helpers/auth.helper';

const mockAuthHelper = {
  verifyToken: jest.fn(),
};

describe('RefreshTokenMiddleware', () => {
  let middleware: RefreshTokenMiddleware;

  beforeEach(() => {
    jest.clearAllMocks();
    middleware = new RefreshTokenMiddleware(
      mockAuthHelper as unknown as AuthHelper,
    );
  });

  it('should extract refresh token, verify it and attach payload to request body', () => {
    const payload = {
      sub: new Types.ObjectId(),
      email: 'test@example.com',
      iat: new Date(),
      exp: new Date(),
    };

    mockAuthHelper.verifyToken.mockReturnValue({ ...payload });

    const req = {
      headers: {
        'refresh-token': 'valid-token',
      },
      body: {},
    } as unknown as Request;

    const next = jest.fn();
    const res = {} as Response;

    middleware.use(req, res, next);

    expect(req.body).toEqual({
      sub: payload.sub,
      email: payload.email,
    });

    expect(mockAuthHelper.verifyToken).toHaveBeenCalledWith('valid-token');
    expect(next).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if refresh-token is missing', () => {
    const req = {
      headers: {},
    } as unknown as Request;

    const res = {} as Response;
    const next = jest.fn();

    expect(() => middleware.use(req, res, next)).toThrow(UnauthorizedException);
    expect(next).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if verifyToken returns undefined', () => {
    mockAuthHelper.verifyToken.mockReturnValue(undefined);

    const req = {
      headers: {
        'refresh-token': 'bad-token',
      },
    } as unknown as Request;

    const res = {} as Response;
    const next = jest.fn();

    expect(() => middleware.use(req, res, next)).toThrow(UnauthorizedException);
    expect(mockAuthHelper.verifyToken).toHaveBeenCalledWith('bad-token');
    expect(next).not.toHaveBeenCalled();
  });
});

import { UnauthorizedException } from '@nestjs/common';
import { Request, Response } from 'express';

import { AuthHelper } from '../../auth/helpers/auth.helper';
import { WalletMiddleware } from './wallet.middleware';

describe('WalletMiddleware', () => {
  let middleware: WalletMiddleware;
  let authHelper: AuthHelper;

  const mockRequest = () => ({
    headers: {},
    body: { userId: '' },
  });

  const mockResponse = () => ({});
  const mockNext = jest.fn();

  beforeEach(() => {
    authHelper = {
      extractToken: jest.fn(),
      verifyToken: jest.fn(),
    } as unknown as AuthHelper;

    middleware = new WalletMiddleware(authHelper);
  });

  it('should throw UnauthorizedException if token is missing', () => {
    (authHelper.extractToken as jest.Mock).mockReturnValue(null);

    const req = mockRequest();
    const res = mockResponse();

    expect(() =>
      middleware.use(req as Request, res as Response, mockNext),
    ).toThrow(UnauthorizedException);
  });

  it('should set userId in req.body and call next() if token is valid', () => {
    const fakeToken = 'fake-token';
    const fakePayload = { sub: 'user-123' };

    (authHelper.extractToken as jest.Mock).mockReturnValue(fakeToken);
    (authHelper.verifyToken as jest.Mock).mockReturnValue(fakePayload);

    const req = mockRequest();
    const res = mockResponse();

    middleware.use(req as Request, res as Response, mockNext);

    expect(req.body.userId).toBe('user-123');
    expect(mockNext).toHaveBeenCalled();
  });

  it('should throw error if verifyToken throws', () => {
    const fakeToken = 'invalid-token';

    (authHelper.extractToken as jest.Mock).mockReturnValue(fakeToken);
    (authHelper.verifyToken as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    const req = mockRequest();
    const res = mockResponse();

    expect(() =>
      middleware.use(req as Request, res as Response, mockNext),
    ).toThrow('Invalid token');
  });
});

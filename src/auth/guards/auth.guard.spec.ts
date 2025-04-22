import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

import { AuthHelper } from '../helpers/auth.helper';
import { AuthGuard } from './auth.guard';

const mockAuthHelper = {
  extractToken: jest.fn(),
  verifyToken: jest.fn(),
};

const createMockContext = (
  headers: Record<string, string> = {},
): ExecutionContext => {
  const mockRequest = {
    headers,
  } as unknown as Request;

  return {
    switchToHttp: () => ({
      getRequest: () => mockRequest,
    }),
  } as unknown as ExecutionContext;
};

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new AuthGuard(mockAuthHelper as unknown as AuthHelper);
  });

  it('should return true if token is present and valid', () => {
    const token = 'valid-token';

    const ctx = createMockContext({
      authorization: `Bearer ${token}`,
    });

    mockAuthHelper.extractToken.mockReturnValue(token);
    mockAuthHelper.verifyToken.mockReturnValue({
      sub: '123',
      email: 'test@example.com',
    });

    expect(guard.canActivate(ctx)).toBe(true);
    expect(mockAuthHelper.extractToken).toHaveBeenCalled();
    expect(mockAuthHelper.verifyToken).toHaveBeenCalledWith(token);
  });

  it('should throw UnauthorizedException if token is missing', () => {
    const ctx = createMockContext();

    mockAuthHelper.extractToken.mockReturnValue(undefined);

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    expect(mockAuthHelper.extractToken).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if token is invalid', () => {
    const token = 'invalid-token';

    const ctx = createMockContext({
      authorization: `Bearer ${token}`,
    });

    mockAuthHelper.extractToken.mockReturnValue(token);
    mockAuthHelper.verifyToken.mockReturnValue(undefined);

    expect(() => guard.canActivate(ctx)).toThrow(UnauthorizedException);
    expect(mockAuthHelper.extractToken).toHaveBeenCalled();
    expect(mockAuthHelper.verifyToken).toHaveBeenCalledWith(token);
  });
});

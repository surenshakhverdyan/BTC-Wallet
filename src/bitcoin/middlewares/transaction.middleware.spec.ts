import { UnauthorizedException } from '@nestjs/common';
import { Response, NextFunction, Request } from 'express';
import { Types } from 'mongoose';

import { TransactionMiddleware } from './transaction.middleware';
import { AuthHelper } from 'src/auth/helpers/auth.helper';
import { WalletProvider } from 'src/wallet/providers/wallet.provider';
import { CryptoService } from 'src/crypto/crypto.service';
import { IJwtPayload } from 'src/auth/interfaces/jwt-payload.interface';

describe('TransactionMiddleware', () => {
  let middleware: TransactionMiddleware;
  let authHelper: jest.Mocked<AuthHelper>;
  let walletProvider: jest.Mocked<WalletProvider>;
  let cryptoService: jest.Mocked<CryptoService>;

  const mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    authHelper = {
      extractToken: jest.fn(),
      verifyToken: jest.fn(),
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    walletProvider = {
      getByUserId: jest.fn(),
    } as any;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    cryptoService = {
      decrypt: jest.fn(),
    } as any;

    middleware = new TransactionMiddleware(
      authHelper,
      walletProvider,
      cryptoService,
    );
  });

  it('should throw UnauthorizedException if no token is found', async () => {
    const mockRequest = {
      headers: {},
    } as unknown as Request;

    authHelper.extractToken.mockReturnValue(undefined);

    await expect(
      middleware.use(mockRequest, {} as Response, mockNext),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should throw UnauthorizedException if token is invalid', async () => {
    const mockRequest = {
      headers: {
        authorization: 'Bearer invalid_token',
      },
    } as unknown as Request;

    authHelper.extractToken.mockReturnValue('invalid_token');

    authHelper.verifyToken.mockReturnValue(undefined as unknown as IJwtPayload);

    await expect(
      middleware.use(mockRequest, {} as Response, mockNext),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('should set decrypted privateKey and call next', async () => {
    const mockPayload: IJwtPayload = {
      sub: new Types.ObjectId(),
      email: 'user@example.com',
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const mockWallet = {
      privateKey: 'encryptedKey',
      address: 'some-address',
      userId: new Types.ObjectId(),
    } as any;

    const decryptedKey = 'decryptedPrivateKey';

    const mockRequest = {
      headers: {
        authorization: 'Bearer valid_token',
      },
      body: {},
    } as unknown as Request;

    authHelper.extractToken.mockReturnValue('valid_token');
    authHelper.verifyToken.mockReturnValue(mockPayload);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    walletProvider.getByUserId.mockResolvedValue(mockWallet);
    cryptoService.decrypt.mockReturnValue(decryptedKey);

    await middleware.use(mockRequest, {} as Response, mockNext);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authHelper.extractToken).toHaveBeenCalledWith(mockRequest);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authHelper.verifyToken).toHaveBeenCalledWith('valid_token');
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(walletProvider.getByUserId).toHaveBeenCalledWith(mockPayload.sub);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(cryptoService.decrypt).toHaveBeenCalledWith('encryptedKey');
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(mockRequest.body.privateKey).toBe(decryptedKey);
    expect(mockNext).toHaveBeenCalled();
  });
});

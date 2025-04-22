import { HttpException } from '@nestjs/common';
import { Model, Types } from 'mongoose';

import { Wallet } from '../schemas/wallet.schema';
import { WalletProvider } from './wallet.provider';

describe('WalletProvider', () => {
  let walletProvider: WalletProvider;
  let walletModel: Model<Wallet>;

  const mockWallet = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    privateKey: 'mockPrivateKey',
    address: 'mockAddress',
  } as Wallet;

  const walletModelMock = {
    create: jest.fn(),
    findOne: jest.fn(),
  };

  beforeEach(() => {
    walletModel = walletModelMock as unknown as Model<Wallet>;
    walletProvider = new WalletProvider(walletModel);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return a wallet', async () => {
      walletModelMock.create.mockResolvedValue(mockWallet);

      const result = await walletProvider.create(
        mockWallet.userId as Types.ObjectId,
        mockWallet.privateKey,
        mockWallet.address,
      );

      expect(walletModelMock.create).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        userId: expect.any(Types.ObjectId),
        privateKey: mockWallet.privateKey,
        address: mockWallet.address,
      });

      expect(result).toEqual(mockWallet);
    });
  });

  describe('getByUserId', () => {
    it('should return a wallet by userId', async () => {
      walletModelMock.findOne.mockResolvedValue(mockWallet);

      const result = await walletProvider.getByUserId(
        mockWallet.userId as Types.ObjectId,
      );

      expect(walletModelMock.findOne).toHaveBeenCalledWith({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        userId: expect.any(Types.ObjectId),
      });

      expect(result).toEqual(mockWallet);
    });

    it('should throw 404 if wallet not found', async () => {
      walletModelMock.findOne.mockResolvedValue(null);

      await expect(
        walletProvider.getByUserId(mockWallet.userId as Types.ObjectId),
      ).rejects.toThrow(HttpException);

      await expect(
        walletProvider.getByUserId(mockWallet.userId as Types.ObjectId),
      ).rejects.toThrow('Wallet not found');
    });
  });
});

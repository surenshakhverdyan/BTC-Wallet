import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { AuthGuard } from '../auth/guards/auth.guard';

describe('WalletController', () => {
  let controller: WalletController;
  let walletService: WalletService;

  const mockWalletService = {
    createWallet: jest.fn(),
    getTransactions: jest.fn(),
    getWallet: jest.fn(),
  };

  const mockWallet = {
    _id: new Types.ObjectId(),
    userId: new Types.ObjectId(),
    address: 'tb1qmockedaddress',
    privateKey: 'encrypted-private-key',
  };

  const mockTransactions = [
    {
      type: 'incoming',
      amount: 0.0001,
      address: 'tb1qmockedaddress',
      date: '2024-04-01T19:33:20.000Z',
      status: 'confirmed',
    },
  ];

  const mockWalletSummary = {
    address: 'tb1qmockedaddress',
    balance: 10000,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: () => true,
      })
      .compile();

    controller = module.get<WalletController>(WalletController);
    walletService = module.get<WalletService>(WalletService);
  });

  describe('createWallet', () => {
    it('should call service and return created wallet', async () => {
      mockWalletService.createWallet.mockResolvedValue(mockWallet);

      const result = await controller.createWallet(mockWallet.userId);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(walletService.createWallet).toHaveBeenCalledWith(
        mockWallet.userId,
      );
      expect(result).toEqual(mockWallet);
    });
  });

  describe('getTransactions', () => {
    it('should return transactions for address', async () => {
      const address = 'tb1qmockedaddress';
      mockWalletService.getTransactions.mockResolvedValue(mockTransactions);

      const result = await controller.getTransactions(address);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(walletService.getTransactions).toHaveBeenCalledWith(address);
      expect(result).toEqual(mockTransactions);
    });
  });

  describe('getWallet', () => {
    it('should return wallet info (address and balance)', async () => {
      const userId = new Types.ObjectId();
      mockWalletService.getWallet.mockResolvedValue(mockWalletSummary);

      const result = await controller.getWallet(userId);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(walletService.getWallet).toHaveBeenCalledWith(userId);
      expect(result).toEqual(mockWalletSummary);
    });
  });
});

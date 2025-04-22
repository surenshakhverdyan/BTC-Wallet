import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { WalletService } from './wallet.service';
import { BlockchainNetworkProvider } from './providers/blockchain-network.provider';
import { WalletProvider } from './providers/wallet.provider';
import { CryptoService } from '../crypto/crypto.service';
import { BitcoinHelper } from '../bitcoin/helpers/bitcoin.helper';

describe('WalletService', () => {
  let walletService: WalletService;

  // Mock Dependencies
  const mockBitcoinHelper = {
    satToBtc: jest.fn((sats) => sats / 1e8),
    btcToSat: jest.fn((btc) => Math.round(btc * 1e8)),
  };

  const mockBlockchainNetworkProvider = {
    getTransactions: jest.fn(),
    getAddress: jest.fn(),
  };

  const mockWalletProvider = {
    getByUserId: jest.fn(),
    create: jest.fn(),
  };

  const mockCryptoService = {
    encrypt: jest.fn((val) => `encrypted-${val}`),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: BlockchainNetworkProvider,
          useValue: mockBlockchainNetworkProvider,
        },
        { provide: WalletProvider, useValue: mockWalletProvider },
        { provide: CryptoService, useValue: mockCryptoService },
        { provide: BitcoinHelper, useValue: mockBitcoinHelper },
      ],
    }).compile();

    walletService = module.get<WalletService>(WalletService);
  });

  describe('getTransactions', () => {
    it('should return parsed transactions', async () => {
      const address = 'tb1qmockedaddress';

      mockBlockchainNetworkProvider.getTransactions.mockResolvedValue([
        {
          vin: [],
          vout: [
            {
              value: 10000,
              scriptpubkey_address: address,
            },
          ],
          status: {
            confirmed: true,
            block_time: 1712000000, // 2024-04-01T19:33:20.000Z
          },
        },
        {
          vin: [
            {
              prevout: {
                scriptpubkey_address: address,
              },
            },
          ],
          vout: [
            {
              value: 5000,
              scriptpubkey_address: 'tb1qreceiveraddress',
            },
          ],
          status: {
            confirmed: true,
            block_time: 1711990500,
          },
        },
      ]);

      const result = await walletService.getTransactions(address);

      expect(result).toEqual([
        {
          type: 'incoming',
          amount: 0.0001,
          address: 'tb1qmockedaddress',
          date: '2024-04-01T19:33:20.000Z',
          status: 'confirmed',
        },
        {
          type: 'outgoing',
          amount: 0.00005,
          address: 'tb1qreceiveraddress',
          date: new Date(1711990500 * 1000).toISOString(),
          status: 'confirmed',
        },
      ]);
    });
  });

  describe('getWallet', () => {
    it('should return wallet address and balance', async () => {
      const userId = new Types.ObjectId();
      const address = 'tb1qmockedaddress';

      mockWalletProvider.getByUserId.mockResolvedValue({
        address,
      });

      mockBlockchainNetworkProvider.getAddress.mockResolvedValue({
        chain_stats: {
          funded_txo_sum: 20000,
          spent_txo_sum: 5000,
        },
      });

      const result = await walletService.getWallet(userId);

      expect(result).toEqual({
        address,
        balance: mockBitcoinHelper.satToBtc(15000),
      });

      expect(mockBitcoinHelper.satToBtc).toHaveBeenCalledWith(15000);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';

import { BitcoinService } from './bitcoin.service';
import { BlockchainProvider } from './providers/blockchain.provider';
import { BitcoinHelper } from './helpers/bitcoin.helper';

const dummyPrivateKeyHex = 'a'.repeat(64);
const dummyPrivateKeyBuffer = Buffer.from(dummyPrivateKeyHex, 'hex');

const mockBlockchainProvider = {
  tweakSigner: jest.fn().mockReturnValue(dummyPrivateKeyBuffer),
  getUTXOs: jest.fn().mockResolvedValue([
    {
      txid: 'abcd'.repeat(8),
      vout: 0,
      value: 200000,
    },
  ]),
  calculateFee: jest.fn().mockResolvedValue(1000),
  broadcastTransaction: jest.fn().mockResolvedValue('txid123'),
};

const mockBitcoinHelper = {
  btcToSat: jest
    .fn()
    .mockImplementation((btc: number) => Math.round(btc * 1e8)),
};

describe('BitcoinService', () => {
  let service: BitcoinService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BitcoinService,
        { provide: BlockchainProvider, useValue: mockBlockchainProvider },
        { provide: BitcoinHelper, useValue: mockBitcoinHelper },
      ],
    }).compile();

    service = module.get<BitcoinService>(BitcoinService);
  });

  it('should complete transaction flow', async () => {
    const transactionDto = {
      privateKey: dummyPrivateKeyHex,
      receivers: [
        {
          address:
            'tb1pngqszh6dm82sfqa8pt5nedkctqjfvjgngzwdjwt80sucku2zlprqrk5rxq',
          amount: 0.00001,
        },
      ],
    };

    jest.spyOn(service, 'transaction').mockResolvedValue('dummyTxHex');

    const result = await service.transaction(transactionDto);
    expect(result).toBe('dummyTxHex');
  });

  it('should throw an error if input is invalid', async () => {
    const invalidDto = {
      privateKey: '',
      receivers: [],
    };

    await expect(service.transaction(invalidDto)).rejects.toThrow(
      HttpException,
    );
  });
});

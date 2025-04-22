import { Test, TestingModule } from '@nestjs/testing';

import { BitcoinController } from './bitcoin.controller';
import { BitcoinService } from './bitcoin.service';
import { TransactionDto } from './dtos/transaction.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { AuthHelper } from '../auth/helpers/auth.helper';

const mockBitcoinService = {
  transaction: jest.fn(),
};

const mockAuthHelper = {};
const mockAuthGuard = {
  canActivate: jest.fn(() => true),
};

describe('BitcoinController', () => {
  let controller: BitcoinController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [BitcoinController],
      providers: [
        { provide: BitcoinService, useValue: mockBitcoinService },
        { provide: AuthHelper, useValue: mockAuthHelper },
        { provide: AuthGuard, useValue: mockAuthGuard },
      ],
    }).compile();

    controller = module.get<BitcoinController>(BitcoinController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('transaction', () => {
    it('should return a transaction hex', async () => {
      const transactionDto: TransactionDto = {
        privateKey: 'dummyPrivateKeyHex',
        receivers: [
          {
            address: 'dummyAddress',
            amount: 0.0001,
          },
        ],
      };

      mockBitcoinService.transaction.mockResolvedValue('dummyTxHex');

      const result = await controller.createTransaction(transactionDto);
      expect(result).toBe('dummyTxHex');
      expect(mockBitcoinService.transaction).toHaveBeenCalledWith(
        transactionDto,
      );
    });

    it('should throw an error if invalid input is provided', async () => {
      const invalidTransactionDto: TransactionDto = {
        privateKey: '',
        receivers: [],
      };

      mockBitcoinService.transaction.mockRejectedValue(
        new Error('Invalid input'),
      );

      await expect(
        controller.createTransaction(invalidTransactionDto),
      ).rejects.toThrowError('Invalid input');
      expect(mockBitcoinService.transaction).toHaveBeenCalledWith(
        invalidTransactionDto,
      );
    });
  });
});

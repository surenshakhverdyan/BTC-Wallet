import mempoolJS from '@mempool/mempool.js';
import { Tx } from '@mempool/mempool.js/lib/interfaces/bitcoin/transactions';
import { Address } from '@mempool/mempool.js/lib/interfaces/bitcoin/addresses';

import { BlockchainNetworkProvider } from './blockchain-network.provider';

jest.mock('@mempool/mempool.js');

describe('BlockchainNetworkProvider', () => {
  let provider: BlockchainNetworkProvider;

  const mockGetAddressTxs = jest.fn();
  const mockGetAddress = jest.fn();

  beforeEach(() => {
    (mempoolJS as unknown as jest.Mock).mockReturnValue({
      bitcoin: {
        addresses: {
          getAddressTxs: mockGetAddressTxs,
          getAddress: mockGetAddress,
        },
      },
    });

    provider = new BlockchainNetworkProvider();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('should return address transactions', async () => {
      const mockTxs: Tx[] = [
        { txid: 'abc123' } as Tx,
        { txid: 'def456' } as Tx,
      ];

      mockGetAddressTxs.mockResolvedValue(mockTxs);

      const result = await provider.getTransactions('tb1qexample');
      expect(mockGetAddressTxs).toHaveBeenCalledWith({
        address: 'tb1qexample',
      });
      expect(result).toEqual(mockTxs);
    });
  });

  describe('getAddress', () => {
    it('should return address info', async () => {
      const mockAddress: Address = {
        address: 'tb1qexample',
        chain_stats: {},
        mempool_stats: {},
      } as Address;

      mockGetAddress.mockResolvedValue(mockAddress);

      const result = await provider.getAddress('tb1qexample');
      expect(mockGetAddress).toHaveBeenCalledWith({ address: 'tb1qexample' });
      expect(result).toEqual(mockAddress);
    });
  });
});

import { Injectable } from '@nestjs/common';
import mempoolJS from '@mempool/mempool.js';
import { Tx } from '@mempool/mempool.js/lib/interfaces/bitcoin/transactions';
import { Address } from '@mempool/mempool.js/lib/interfaces/bitcoin/addresses';

@Injectable()
export class BlockchainNetworkProvider {
  private readonly bitcoin: ReturnType<typeof mempoolJS>['bitcoin'];

  constructor() {
    this.bitcoin = mempoolJS({
      hostname: 'mempool.space',
      network: 'testnet',
    }).bitcoin;
  }

  async getTransactions(address: string): Promise<Tx[]> {
    return await this.bitcoin.addresses.getAddressTxs({ address });
  }

  async getAddress(address: string): Promise<Address> {
    return await this.bitcoin.addresses.getAddress({ address });
  }
}

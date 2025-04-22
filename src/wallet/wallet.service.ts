import { Injectable } from '@nestjs/common';
import { Types } from 'mongoose';
import { ECPairFactory } from 'ecpair';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

import { WalletProvider } from './providers/wallet.provider';
import { Wallet } from './schemas/wallet.schema';
import { CryptoService } from '../crypto/crypto.service';
import { BlockchainNetworkProvider } from './providers/blockchain-network.provider';
import { ITransaction } from './interfaces/transaction.interface';
import { BitcoinHelper } from '../bitcoin/helpers/bitcoin.helper';

@Injectable()
export class WalletService {
  private readonly network = bitcoin.networks.testnet;
  private readonly ECPair = ECPairFactory(ecc);

  constructor(
    private readonly blockchainNetworkProvider: BlockchainNetworkProvider,
    private readonly walletProvider: WalletProvider,
    private readonly cryptoService: CryptoService,
    private readonly bitcoinHelper: BitcoinHelper,
  ) {
    bitcoin.initEccLib(ecc);
  }

  async createWallet(userId: Types.ObjectId): Promise<Wallet> {
    const keyPair = this.ECPair.makeRandom({
      network: this.network,
    });

    const privateKey = keyPair.privateKey?.toString('hex');
    const privateKeyEncrypted = this.cryptoService.encrypt(privateKey!);

    const p2tr = bitcoin.payments.p2tr({
      internalPubkey: Buffer.from(ecc.xOnlyPointFromPoint(keyPair.publicKey)),
      network: this.network,
    });
    const address = p2tr.address!.toString();

    return await this.walletProvider.create(
      userId,
      privateKeyEncrypted,
      address,
    );
  }

  async getTransactions(address: string): Promise<ITransaction[]> {
    const txs = await this.blockchainNetworkProvider.getTransactions(address);

    const transactions: ITransaction[] = [];
    txs.forEach((tx) => {
      const isIncoming = tx.vout.some(
        (v) =>
          v.scriptpubkey_address && address.includes(v.scriptpubkey_address),
      );
      const isOutgoing = tx.vin.some(
        (v) =>
          v.prevout?.scriptpubkey_address &&
          address.includes(v.prevout.scriptpubkey_address),
      );

      if (isIncoming && !isOutgoing) {
        for (const vout of tx.vout) {
          if (address.includes(vout.scriptpubkey_address)) {
            transactions.push({
              type: 'incoming',
              amount: this.bitcoinHelper.satToBtc(vout.value),
              address: vout.scriptpubkey_address,
              date: tx.status.block_time
                ? new Date(tx.status.block_time * 1000).toISOString()
                : '-',
              status: tx.status.confirmed ? 'confirmed' : 'pending',
            });
          }
        }
      } else if (isOutgoing) {
        for (const vout of tx.vout) {
          if (!address.includes(vout.scriptpubkey_address)) {
            transactions.push({
              type: 'outgoing',
              amount: this.bitcoinHelper.satToBtc(vout.value),
              address: vout.scriptpubkey_address,
              date: tx.status.block_time
                ? new Date(tx.status.block_time * 1000).toISOString()
                : '-',
              status: tx.status.confirmed ? 'confirmed' : 'pending',
            });
          }
        }
      }
    });

    return transactions;
  }

  async getWallet(
    userId: Types.ObjectId,
  ): Promise<{ address: string; balance: number }> {
    const wallet = await this.walletProvider.getByUserId(userId);
    const addressInfo = await this.blockchainNetworkProvider.getAddress(
      wallet.address,
    );

    return {
      address: wallet.address,
      balance: this.bitcoinHelper.satToBtc(
        addressInfo.chain_stats.funded_txo_sum -
          addressInfo.chain_stats.spent_txo_sum,
      ),
    };
  }
}

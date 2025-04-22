import { HttpException, Injectable } from '@nestjs/common';
import { ECPairFactory } from 'ecpair';
import * as bitcoin from 'bitcoinjs-lib';
import * as ecc from 'tiny-secp256k1';

import { BlockchainProvider } from './providers/blockchain.provider';
import { TransactionDto } from './dtos/transaction.dto';
import { BitcoinHelper } from './helpers/bitcoin.helper';

@Injectable()
export class BitcoinService {
  private readonly network = bitcoin.networks.testnet;
  private readonly ECPair = ECPairFactory(ecc);

  constructor(
    private readonly blockchainProvider: BlockchainProvider,
    private readonly bitcoinHelper: BitcoinHelper,
  ) {
    bitcoin.initEccLib(ecc);
  }

  async transaction(dto: TransactionDto): Promise<string> {
    try {
      dto.receivers.forEach((receiver) => {
        receiver.amount = this.bitcoinHelper.btcToSat(receiver.amount);
      });

      const totalAmount = dto.receivers.reduce((sum, receiver) => {
        return (sum += receiver.amount);
      }, 0);

      const keyPair = this.ECPair.fromPrivateKey(
        Buffer.from(dto.privateKey, 'hex'),
        {
          network: this.network,
        },
      );

      const tweakedPrivateKey = this.ECPair.fromPrivateKey(
        Buffer.from(this.blockchainProvider.tweakSigner(keyPair)),
      );

      const p2tr = bitcoin.payments.p2tr({
        internalPubkey: Buffer.from(ecc.xOnlyPointFromPoint(keyPair.publicKey)),
        network: this.network,
      });

      const utxos = await this.blockchainProvider.getUTXOs(p2tr.address!);
      if (utxos.length === 0)
        throw new HttpException('Insufficient funds', 403);

      const psbt = new bitcoin.Psbt({ network: this.network });

      let totalInputsValue = 0;
      utxos.forEach((utxo) => {
        psbt.addInput({
          hash: Buffer.from(utxo.txid, 'hex').reverse(),
          index: utxo.vout,
          witnessUtxo: {
            script: p2tr.output!,
            value: utxo.value,
          },
          tapInternalKey: Buffer.from(
            ecc.xOnlyPointFromPoint(keyPair.publicKey),
          ),
          sequence: 0xfffffffd,
        });

        totalInputsValue += utxo.value;

        if (totalInputsValue >= totalAmount + 1000) return;
      });

      dto.receivers.forEach((receiver) => {
        psbt.addOutput({
          address: receiver.address,
          value: receiver.amount,
        });
      });

      const fee = await this.blockchainProvider.calculateFee(
        psbt,
        tweakedPrivateKey,
      );
      const change = totalInputsValue - totalAmount - fee;

      if (totalInputsValue < totalAmount + fee) {
        throw new HttpException(
          `Insufficient funds. Needed: ${totalAmount + fee} sat, Available: ${totalInputsValue} sat`,
          403,
        );
      }

      if (change > 0) {
        psbt.addOutput({
          address: p2tr.address!,
          value: change,
        });
      }

      psbt.signAllInputs(tweakedPrivateKey);
      psbt.finalizeAllInputs();
      const rawTx = psbt.extractTransaction().toHex();

      return await this.blockchainProvider.broadcastTransaction(rawTx);
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(error.message, 403);
      }
      throw new HttpException('An unknown error occurred', 500);
    }
  }
}

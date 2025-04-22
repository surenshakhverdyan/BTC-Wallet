import { HttpException, Injectable } from '@nestjs/common';
import mempoolJS from '@mempool/mempool.js';
import { AddressTxsUtxo } from '@mempool/mempool.js/lib/interfaces/bitcoin/addresses';
import { ECPairInterface } from 'ecpair';
import * as ecc from 'tiny-secp256k1';
import * as bitcoin from 'bitcoinjs-lib';

import { IServiceFee } from '../interfaces/service-fee.interface';

@Injectable()
export class BlockchainProvider {
  private readonly bitcoin: ReturnType<typeof mempoolJS>['bitcoin'];

  constructor() {
    this.bitcoin = mempoolJS({
      hostname: 'mempool.space',
      network: 'testnet',
    }).bitcoin;
  }

  async getUTXOs(address: string): Promise<AddressTxsUtxo[]> {
    return await this.bitcoin.addresses.getAddressTxsUtxo({ address });
  }

  async getServiceFee(): Promise<IServiceFee> {
    return (await this.bitcoin.fees.getFeesRecommended()) as IServiceFee;
  }

  async calculateFee(
    psbt: bitcoin.Psbt,
    tweakedPrivateKey: ECPairInterface,
  ): Promise<number> {
    const feeRates = await this.getServiceFee();

    const tx = psbt.clone();
    tx.signAllInputs(tweakedPrivateKey);
    tx.finalizeAllInputs();
    const vSize = tx.extractTransaction().virtualSize();

    return vSize * feeRates.economyFee < 154
      ? 154
      : vSize * feeRates.economyFee;
  }

  async broadcastTransaction(txHex: string): Promise<string> {
    return (await this.bitcoin.transactions.postTx({ txhex: txHex })) as string;
  }

  tweakSigner(keyPair: ECPairInterface): Uint8Array {
    let privateKey = Buffer.from(keyPair.privateKey!);
    if (!privateKey) {
      throw new HttpException(
        'Private key is required for tweaking signer!',
        403,
      );
    }

    if (keyPair.publicKey[0] === 3) {
      privateKey = Buffer.from(ecc.privateNegate(privateKey));
    }

    const tweakedPrivateKey = ecc.privateAdd(
      privateKey,
      bitcoin.crypto.taggedHash(
        'TapTweak',
        Buffer.concat([
          Buffer.from(ecc.xOnlyPointFromPoint(keyPair.publicKey)),
        ]),
      ),
    );
    if (!tweakedPrivateKey) {
      throw new HttpException('Invalid tweaked private key!', 403);
    }

    return tweakedPrivateKey;
  }
}

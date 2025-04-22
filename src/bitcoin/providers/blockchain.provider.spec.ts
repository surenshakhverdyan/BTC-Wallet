import { Test, TestingModule } from '@nestjs/testing';
import { ECPairInterface } from 'ecpair';
import * as bitcoin from 'bitcoinjs-lib';

import { BlockchainProvider } from './blockchain.provider';

jest.mock('@mempool/mempool.js', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    bitcoin: {
      addresses: {
        getAddressTxsUtxo: jest.fn().mockResolvedValue([
          {
            txid: 'mock-txid',
            vout: 0,
            value: 10000,
            status: { confirmed: true, block_height: 123456 },
          },
        ]),
      },
      fees: {
        getFeesRecommended: jest.fn().mockResolvedValue({
          fastestFee: 200,
          halfHourFee: 150,
          hourFee: 100,
          economyFee: 2,
          minimumFee: 1,
        }),
      },
      transactions: {
        postTx: jest.fn().mockResolvedValue('mock-txid'),
      },
    },
  })),
}));

describe('BlockchainProvider', () => {
  let provider: BlockchainProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BlockchainProvider],
    }).compile();

    provider = module.get<BlockchainProvider>(BlockchainProvider);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  it('should return UTXOs for an address', async () => {
    const address = 'tb1qexampleaddress';
    const utxos = await provider.getUTXOs(address);

    expect(utxos).toHaveLength(1);
    expect(utxos[0].txid).toBe('mock-txid');
  });

  it('should return service fees', async () => {
    const fee = await provider.getServiceFee();
    expect(fee).toEqual({
      fastestFee: 200,
      halfHourFee: 150,
      hourFee: 100,
      economyFee: 2,
      minimumFee: 1,
    });
  });

  it('should calculate transaction fee correctly', async () => {
    const psbtStub = {
      clone: () => psbtStub,
      signAllInputs: jest.fn(),
      finalizeAllInputs: jest.fn(),
      extractTransaction: () => ({
        virtualSize: () => 100,
      }),
    } as unknown as bitcoin.Psbt;

    const validKeyPair: ECPairInterface = {
      privateKey: Buffer.alloc(32, 1),
      publicKey: Buffer.concat([Buffer.from([0x02]), Buffer.alloc(32, 2)]),
      compressed: true,
      network: bitcoin.networks.testnet,
      lowR: false,
      toWIF: () => 'mock-wif',
      tweak: jest.fn(),
      verify: jest.fn(),
      verifySchnorr: jest.fn(),
      signSchnorr: jest.fn(),
      sign: jest.fn(),
    };

    const fee = await provider.calculateFee(psbtStub, validKeyPair);
    expect(typeof fee).toBe('number');
    expect(fee).toBe(200);
  });

  it('should broadcast transaction successfully', async () => {
    const txHex = '0200000001...';
    const txid = await provider.broadcastTransaction(txHex);
    expect(txid).toBe('mock-txid');
  });

  it('should tweak signer correctly', () => {
    const validKeyPair: ECPairInterface = {
      privateKey: Buffer.alloc(32, 1),
      publicKey: Buffer.concat([Buffer.from([0x02]), Buffer.alloc(32, 2)]),
      compressed: true,
      network: bitcoin.networks.testnet,
      lowR: false,
      toWIF: () => 'mock-wif',
      tweak: jest.fn(),
      verify: jest.fn(),
      verifySchnorr: jest.fn(),
      signSchnorr: jest.fn(),
      sign: jest.fn(),
    };

    const tweakedPrivateKey = provider.tweakSigner(validKeyPair);
    expect(tweakedPrivateKey).toBeInstanceOf(Uint8Array);
    expect(tweakedPrivateKey.length).toBe(32);
  });

  it('should throw error if private key is missing in tweakSigner', () => {
    const invalidKeyPair: ECPairInterface = {
      privateKey: undefined,
      publicKey: Buffer.concat([Buffer.from([0x02]), Buffer.alloc(32, 2)]),
      compressed: true,
      network: bitcoin.networks.testnet,
      lowR: false,
      toWIF: () => 'mock-wif',
      tweak: jest.fn(),
      verify: jest.fn(),
      verifySchnorr: jest.fn(),
      signSchnorr: jest.fn(),
      sign: jest.fn(),
    };

    expect(() => provider.tweakSigner(invalidKeyPair)).toThrowError();
  });
});

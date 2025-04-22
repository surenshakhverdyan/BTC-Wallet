import { Test, TestingModule } from '@nestjs/testing';

import { BitcoinHelper } from './bitcoin.helper';

describe('BitcoinHelper', () => {
  let provider: BitcoinHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [BitcoinHelper],
    }).compile();

    provider = module.get<BitcoinHelper>(BitcoinHelper);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });

  describe('btcToSat', () => {
    it('should convert 1 BTC to 100,000,000 satoshis', () => {
      expect(provider.btcToSat(1)).toBe(100000000);
    });

    it('should convert 0.5 BTC to 50,000,000 satoshis', () => {
      expect(provider.btcToSat(0.5)).toBe(50000000);
    });

    it('should correctly round small decimals', () => {
      expect(provider.btcToSat(0.123456789)).toBe(12345679);
    });

    it('should handle 0 BTC', () => {
      expect(provider.btcToSat(0)).toBe(0);
    });
  });

  describe('satToBtc', () => {
    it('should convert 100,000,000 satoshis to 1 BTC', () => {
      expect(provider.satToBtc(100000000)).toBe(1);
    });

    it('should convert 50,000,000 satoshis to 0.5 BTC', () => {
      expect(provider.satToBtc(50000000)).toBe(0.5);
    });

    it('should return a value close to original BTC after conversion', () => {
      const btc = 0.12345679;
      const sats = provider.btcToSat(btc);
      expect(provider.satToBtc(sats)).toBeCloseTo(btc, 8);
    });

    it('should handle 0 satoshis', () => {
      expect(provider.satToBtc(0)).toBe(0);
    });
  });
});

import { Injectable } from '@nestjs/common';

@Injectable()
export class BitcoinHelper {
  btcToSat(btc: number): number {
    return Math.round(btc * 1e8);
  }

  satToBtc(sat: number): number {
    return sat / 1e8;
  }
}

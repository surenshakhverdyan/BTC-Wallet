import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';

import { BitcoinService } from './bitcoin.service';
import { BitcoinController } from './bitcoin.controller';
import { BlockchainProvider } from './providers/blockchain.provider';
import { BitcoinHelper } from './helpers/bitcoin.helper';
import { CryptoModule } from 'src/crypto/crypto.module';
import { AuthModule } from 'src/auth/auth.module';
import { TransactionMiddleware } from './middlewares/transaction.middleware';
import { WalletModule } from 'src/wallet/wallet.module';

@Module({
  imports: [CryptoModule, AuthModule, WalletModule],
  providers: [BitcoinService, BlockchainProvider, BitcoinHelper],
  controllers: [BitcoinController],
  exports: [BitcoinHelper],
})
export class BitcoinModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(TransactionMiddleware).forRoutes('bitcoin/transaction');
  }
}

import {
  forwardRef,
  MiddlewareConsumer,
  Module,
  NestModule,
} from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { WalletProvider } from './providers/wallet.provider';
import { Wallet, walletSchema } from './schemas/wallet.schema';
import { AuthModule } from 'src/auth/auth.module';
import { CryptoModule } from 'src/crypto/crypto.module';
import { WalletMiddleware } from './middlewares/wallet.middleware';
import { BlockchainNetworkProvider } from './providers/blockchain-network.provider';
import { BitcoinModule } from 'src/bitcoin/bitcoin.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Wallet.name, schema: walletSchema }]),
    forwardRef(() => BitcoinModule),
    AuthModule,
    CryptoModule,
  ],
  providers: [WalletService, WalletProvider, BlockchainNetworkProvider],
  controllers: [WalletController],
  exports: [WalletProvider],
})
export class WalletModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(WalletMiddleware).forRoutes('wallet/create', 'wallet');
  }
}

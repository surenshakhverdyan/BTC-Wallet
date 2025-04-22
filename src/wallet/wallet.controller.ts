import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { Types } from 'mongoose';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/guards/auth.guard';
import { WalletService } from './wallet.service';
import { Wallet } from './schemas/wallet.schema';
import { ITransaction } from './interfaces/transaction.interface';

@ApiTags('wallet')
@ApiBearerAuth()
@Controller('wallet')
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  @Post('create')
  @ApiOperation({ summary: 'Create a new wallet' })
  @ApiResponse({ status: 201, description: 'Wallet created successfully' })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  createWallet(@Body('userId') userId: Types.ObjectId): Promise<Wallet> {
    return this.walletService.createWallet(userId);
  }

  @UseGuards(AuthGuard)
  @Get('transactions/:address')
  @ApiOperation({ summary: 'Get wallet transactions by address' })
  @ApiResponse({
    status: 200,
    description:
      'Returns the list of wallet transactions for the given address',

    type: Array,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getTransactions(@Param('address') address: string): Promise<ITransaction[]> {
    return this.walletService.getTransactions(address);
  }

  @UseGuards(AuthGuard)
  @Get()
  @ApiOperation({ summary: 'Get wallet details' })
  @ApiResponse({
    status: 200,
    description: 'Returns the wallet address and balance',
    type: Object,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  getWallet(
    @Body('userId') userId: Types.ObjectId,
  ): Promise<{ address: string; balance: number }> {
    return this.walletService.getWallet(userId);
  }
}

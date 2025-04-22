import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { AuthGuard } from '../auth/guards/auth.guard';
import { BitcoinService } from './bitcoin.service';
import { TransactionDto } from './dtos/transaction.dto';

@ApiTags('bitcoin')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('bitcoin')
export class BitcoinController {
  constructor(private readonly bitcoinService: BitcoinService) {}

  @HttpCode(HttpStatus.OK)
  @Post('transaction')
  @ApiOperation({ summary: 'Create a new Bitcoin transaction' })
  @ApiResponse({
    status: 200,
    description: 'Transaction created successfully',
    schema: {
      type: 'string',
      description: 'Transaction hash',
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Insufficient funds' })
  async createTransaction(@Body() dto: TransactionDto): Promise<string> {
    return await this.bitcoinService.transaction(dto);
  }
}

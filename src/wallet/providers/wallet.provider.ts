import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Wallet } from '../schemas/wallet.schema';

@Injectable()
export class WalletProvider {
  constructor(
    @InjectModel(Wallet.name) private readonly walletModel: Model<Wallet>,
  ) {}

  async create(
    userId: Types.ObjectId,
    privateKey: string,
    address: string,
  ): Promise<Wallet> {
    userId = new Types.ObjectId(userId);
    return await this.walletModel.create({ userId, privateKey, address });
  }

  async getByUserId(userId: Types.ObjectId): Promise<Wallet> {
    userId = new Types.ObjectId(userId);
    const wallet = await this.walletModel.findOne({ userId });
    if (!wallet) throw new HttpException('Wallet not found', 404);

    return wallet;
  }
}

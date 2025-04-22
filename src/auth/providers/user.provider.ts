import { HttpException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User } from '../schemas/user.schema';
import { IUser } from '../interfaces/user.interface';

@Injectable()
export class UserProvider {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(name: string, email: string, password: string): Promise<User> {
    try {
      return await this.userModel.create({ name, email, password });
    } catch (error: unknown) {
      if (error instanceof Error) {
        throw new HttpException(error.message, 500);
      }
      throw new HttpException('Internal server error', 500);
    }
  }

  async getByEmail(email: string): Promise<User | null> {
    return await this.userModel.findOne({ email });
  }

  userResponse(user: User, authToken?: string, refreshToken?: string): IUser {
    return {
      name: user.name,
      email: user.email,
      authToken,
      refreshToken,
    };
  }
}

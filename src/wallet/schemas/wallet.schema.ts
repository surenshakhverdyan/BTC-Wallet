import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

import { User } from 'src/auth/schemas/user.schema';

@Schema({ timestamps: true })
export class Wallet extends Document {
  @Prop({ type: String, required: true })
  privateKey: string;

  @Prop({ type: String, required: true })
  address: string;

  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId | User;
}

export const walletSchema = SchemaFactory.createForClass(Wallet);

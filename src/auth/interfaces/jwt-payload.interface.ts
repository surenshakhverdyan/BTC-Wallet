import { Types } from 'mongoose';

export interface IJwtPayload {
  sub: Types.ObjectId;
  email: string;
  iat?: Date;
  exp?: Date;
}

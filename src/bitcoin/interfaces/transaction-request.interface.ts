import { Request } from 'express';

export interface TransactionRequest extends Request {
  body: { privateKey: string };
}

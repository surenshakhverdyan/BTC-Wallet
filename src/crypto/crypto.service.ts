import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
  private AES_KEY: string;
  private IV_LENGTH: number;

  constructor(private readonly configService: ConfigService) {
    this.AES_KEY = configService.get<string>('AES_KEY')!;
    this.IV_LENGTH = configService.get<number>('IV_LENGTH')!;
  }

  encrypt(privateKey: string): string {
    const iv = crypto.randomBytes(this.IV_LENGTH);
    const cipher = crypto.createCipheriv(
      'aes-256-gcm',
      Buffer.from(this.AES_KEY, 'hex'),
      iv,
    );

    let encrypted = cipher.update(privateKey, 'utf-8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag().toString('hex');

    return `${iv.toString('hex')}${encrypted}${authTag}`;
  }

  decrypt(encryptedKey: string): string {
    const iv = Buffer.from(encryptedKey.slice(0, this.IV_LENGTH * 2), 'hex');

    const authTag = Buffer.from(
      encryptedKey.slice(encryptedKey.length - 32),
      'hex',
    );

    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(this.AES_KEY, 'hex'),
      iv,
    );
    decipher.setAuthTag(authTag);

    const encrypted = encryptedKey.slice(
      this.IV_LENGTH * 2,
      encryptedKey.length - 32,
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf-8');

    return (decrypted += decipher.final('utf-8'));
  }
}

import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  let service: CryptoService;

  const mockAESKey = crypto.randomBytes(32).toString('hex');
  const mockIVLength = 12;

  const mockConfigService = {
    get: (key: string) => {
      if (key === 'AES_KEY') return mockAESKey;
      if (key === 'IV_LENGTH') return mockIVLength;
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CryptoService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<CryptoService>(CryptoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should encrypt and decrypt correctly', () => {
    const originalText = 'my-super-secret-key';
    const encrypted = service.encrypt(originalText);
    expect(typeof encrypted).toBe('string');
    expect(encrypted).not.toBe(originalText);

    const decrypted = service.decrypt(encrypted);
    expect(decrypted).toBe(originalText);
  });

  it('should throw an error if decryption fails (wrong auth tag)', () => {
    const originalText = 'this-will-break';
    const encrypted = service.encrypt(originalText);

    const tamperedEncrypted = encrypted.slice(0, -1) + '0';

    expect(() => {
      service.decrypt(tamperedEncrypted);
    }).toThrow();
  });
});

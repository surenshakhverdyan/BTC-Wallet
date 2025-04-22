import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Response } from 'supertest';
import * as request from 'supertest';

import { AppModule } from '../src/app.module';
import { IUser } from 'src/auth/interfaces/user.interface';
import { TransactionDto } from 'src/bitcoin/dtos/transaction.dto';
import { BitcoinService } from '../src/bitcoin/bitcoin.service';
import { User } from '../src/auth/schemas/user.schema';
import { AuthHelper } from '../src/auth/helpers/auth.helper';
import { WalletProvider } from '../src/wallet/providers/wallet.provider';
import { CryptoService } from '../src/crypto/crypto.service';

let authToken: string;
let userModel: Model<User>;

const mockBitcoinService = {
  transaction: jest.fn().mockResolvedValue('mock-transaction-id'),
};

const mockAuthHelper = {
  extractToken: jest.fn(() => 'mock-token'),
  verifyToken: jest.fn(() => ({ sub: 'mock-user-id' })),
  hash: jest.fn((value: string) => `hashed-${value}`),
  compare: jest.fn((raw: string, hashed: string) => `hashed-${raw}` === hashed),
  signAuthToken: jest.fn(() => 'mock-auth-token'),
  signRefreshToken: jest.fn(() => 'mock-refresh-token'),
};

const mockWalletProvider = {
  getByUserId: jest.fn().mockResolvedValue({
    privateKey: 'encrypted-mock-key',
  }),
};

const mockCryptoService = {
  decrypt: jest.fn(() => 'mock-private-key'),
};

describe('BitcoinController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(BitcoinService)
      .useValue(mockBitcoinService)
      .overrideProvider(AuthHelper)
      .useValue(mockAuthHelper)
      .overrideProvider(WalletProvider)
      .useValue(mockWalletProvider)
      .overrideProvider(CryptoService)
      .useValue(mockCryptoService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: 'test@email.com' });
    await app.close();
  });

  const testUser = {
    name: 'Test User',
    email: 'test@email.com',
    password: 'pass1234',
    confirmPassword: 'pass1234',
  };

  it('POST /auth/sign-up - should register test user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res: Response = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(testUser)
      .expect(201);

    const body = res.body as IUser;
    expect(body).toHaveProperty('authToken');
    expect(body).toHaveProperty('refreshToken');
  });

  it('POST /auth/sign-in - should sign in user', async () => {
    const credentials = {
      email: testUser.email,
      password: testUser.password,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res: Response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send(credentials)
      .expect(200);

    const body = res.body as IUser;
    expect(body).toHaveProperty('authToken');
    expect(body).toHaveProperty('refreshToken');
    authToken = body.authToken!;
  });

  it('POST /bitcoin/transaction - should process transaction', async () => {
    const dto: TransactionDto = {
      privateKey: '',
      receivers: [
        {
          address: 'tb1qmockedaddress123456',
          amount: 0.00001,
        },
      ],
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res = await request(app.getHttpServer())
      .post('/bitcoin/transaction')
      .set('Authorization', `Bearer ${authToken}`)
      .send(dto)
      .expect(200);

    expect(mockBitcoinService.transaction).toHaveBeenCalledWith({
      ...dto,
      privateKey: 'mock-private-key',
    });

    expect(res.text).toBe('mock-transaction-id');
  });
});

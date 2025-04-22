import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { Types } from 'mongoose';

import { WalletController } from '../src/wallet/wallet.controller';
import { WalletService } from '../src/wallet/wallet.service';
import { AuthGuard } from '../src/auth/guards/auth.guard';

const mockUserId = new Types.ObjectId();
const mockWallet = {
  _id: new Types.ObjectId(),
  userId: mockUserId,
  privateKeyEncrypted: 'encrypted-key',
  address: 'tb1qmockedaddress123456',
  createdAt: new Date(),
};

const mockTransactions = [
  {
    type: 'incoming',
    amount: 0.001,
    address: mockWallet.address,
    date: '2024-01-01T00:00:00.000Z',
    status: 'confirmed',
  },
];

const mockWalletService = {
  createWallet: jest.fn().mockResolvedValue(mockWallet),
  getWallet: jest.fn().mockResolvedValue({
    address: mockWallet.address,
    balance: 100000,
  }),
  getTransactions: jest.fn().mockResolvedValue(mockTransactions),
};

describe('WalletController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      controllers: [WalletController],
      providers: [
        {
          provide: WalletService,
          useValue: mockWalletService,
        },
      ],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/wallet/create (POST)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .post('/wallet/create')
      .send({ userId: mockUserId.toHexString() });

    expect(response.status).toBe(201);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.address).toBe(mockWallet.address);
  });

  it('/wallet (GET)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer())
      .get('/wallet')
      .send({ userId: mockUserId.toHexString() });

    expect(response.status).toBe(200);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body.address).toBe(mockWallet.address);
  });

  it('/wallet/transactions/:address (GET)', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const response = await request(app.getHttpServer()).get(
      `/wallet/transactions/${mockWallet.address}`,
    );

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    expect(response.body[0]).toHaveProperty('type', 'incoming');
  });
});

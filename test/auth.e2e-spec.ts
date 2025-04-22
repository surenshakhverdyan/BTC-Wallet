import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Response } from 'supertest';
import * as request from 'supertest';

import { User } from '../src/auth/schemas/user.schema';
import { AppModule } from './../src/app.module';
import { IUser } from 'src/auth/interfaces/user.interface';

let userModel: Model<User>;

describe('AuthController (e2e)', () => {
  let app: INestApplication;
  let refreshToken: string;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    userModel = moduleFixture.get<Model<User>>(getModelToken(User.name));
  });

  afterAll(async () => {
    await userModel.deleteMany({ email: 'e2e@example.com' });
    await app.close();
  });

  const testUser = {
    name: 'E2ETestUser',
    email: 'e2e@example.com',
    password: 'password123',
    confirmPassword: 'password123',
  };

  it('POST /auth/sign-up - should register a new user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res: Response = await request(app.getHttpServer())
      .post('/auth/sign-up')
      .send(testUser)
      .expect(201);

    const body = res.body as IUser;

    expect(body).toHaveProperty('authToken');
    expect(body).toHaveProperty('refreshToken');
    refreshToken = body.refreshToken!;
  });

  it('POST /auth/sign-in - should login the user', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res: Response = await request(app.getHttpServer())
      .post('/auth/sign-in')
      .send({ email: testUser.email, password: testUser.password })
      .expect(200);

    expect(res.body).toHaveProperty('authToken');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('POST /auth/refresh-token - should return new auth token', async () => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const res: Response = await request(app.getHttpServer())
      .post('/auth/refresh-token')
      .set('Refresh-Token', refreshToken)
      .expect(200);

    expect(res.body).toHaveProperty('authToken');
  });
});

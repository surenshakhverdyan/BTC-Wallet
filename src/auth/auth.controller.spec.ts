import { Test, TestingModule } from '@nestjs/testing';
import { Types } from 'mongoose';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SignUpDto } from 'src/auth/dtos/sign-up.dto';
import { SignInDto } from './dtos/sign-in.dto';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { IUser } from './interfaces/user.interface';

jest.mock('./auth.service');

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            signUp: jest.fn(),
            signIn: jest.fn(),
            refreshToken: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(authController).toBeDefined();
  });

  it('should sign up a new user and return a user with tokens', async () => {
    const signUpDto: SignUpDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'password123',
      confirmPassword: 'password123',
    };

    const mockUser: IUser = {
      name: 'John Doe',
      email: 'john@example.com',
      authToken: 'authToken123',
      refreshToken: 'refreshToken123',
    };

    (authService.signUp as jest.Mock).mockResolvedValue(mockUser);

    const result = await authController.signUp(signUpDto);

    expect(result).toEqual(mockUser);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.signUp).toHaveBeenCalledWith(signUpDto);
  });

  it('should sign in a user and return tokens', async () => {
    const signInDto: SignInDto = {
      email: 'john@example.com',
      password: 'password123',
    };

    const mockUser: IUser = {
      name: 'John Doe',
      email: 'john@example.com',
      authToken: 'authToken123',
      refreshToken: 'refreshToken123',
    };

    (authService.signIn as jest.Mock).mockResolvedValue(mockUser);

    const result = await authController.signIn(signInDto);

    expect(result).toEqual(mockUser);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.signIn).toHaveBeenCalledWith(signInDto);
  });

  it('should refresh token and return a new auth token', () => {
    const payload: IJwtPayload = {
      sub: new Types.ObjectId(),
      email: 'john@example.com',
    };

    const newAuthToken = 'newAuthToken123';

    (authService.refreshToken as jest.Mock).mockReturnValue({
      authToken: newAuthToken,
    });

    const result = authController.refreshToken(payload);

    expect(result).toEqual({ authToken: newAuthToken });
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(authService.refreshToken).toHaveBeenCalledWith(payload);
  });
});

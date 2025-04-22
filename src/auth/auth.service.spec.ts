import { Types } from 'mongoose';

import { AuthService } from './auth.service';
import { UserProvider } from './providers/user.provider';
import { AuthHelper } from './helpers/auth.helper';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { User } from './schemas/user.schema';

jest.mock('./providers/user.provider');
jest.mock('./helpers/auth.helper');

describe('AuthService', () => {
  let authService: AuthService;
  let mockUserProvider: jest.Mocked<UserProvider>;
  let mockAuthHelper: jest.Mocked<AuthHelper>;

  beforeEach(() => {
    mockUserProvider = {
      create: jest.fn(),
      getByEmail: jest.fn(),
      userResponse: jest.fn(),
    } as unknown as jest.Mocked<UserProvider>;

    mockAuthHelper = {
      hash: jest.fn(),
      compare: jest.fn(),
      signAuthToken: jest.fn(),
      signRefreshToken: jest.fn(),
      verifyToken: jest.fn(),
      extractToken: jest.fn(),
    } as unknown as jest.Mocked<AuthHelper>;

    authService = new AuthService(mockUserProvider, mockAuthHelper);
  });

  it('should sign up a new user and return a user with tokens', async () => {
    const dto = {
      name: 'John',
      email: 'john@example.com',
      password: 'password',
      confirmPassword: 'password',
    };
    const hashedPassword = 'hashedPassword';

    const user = {
      _id: new Types.ObjectId(),
      name: dto.name,
      email: dto.email,
      password: hashedPassword,
    };

    const payload: IJwtPayload = {
      sub: user._id,
      email: user.email,
    };

    const authToken = 'auth123';
    const refreshToken = 'refresh456';

    mockAuthHelper.hash.mockResolvedValue(hashedPassword);
    mockUserProvider.create.mockResolvedValue(user as unknown as User);
    mockAuthHelper.signAuthToken.mockReturnValue(authToken);
    mockAuthHelper.signRefreshToken.mockReturnValue(refreshToken);
    mockUserProvider.userResponse.mockReturnValue({
      name: user.name,
      email: user.email,
      authToken,
      refreshToken,
    });

    const result = await authService.signUp(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUserProvider.create).toHaveBeenCalledWith(
      dto.name,
      dto.email,
      hashedPassword,
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockAuthHelper.signAuthToken).toHaveBeenCalledWith(payload);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockAuthHelper.signRefreshToken).toHaveBeenCalledWith(payload);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUserProvider.userResponse).toHaveBeenCalledWith(
      user,
      authToken,
      refreshToken,
    );

    expect(result).toEqual({
      name: user.name,
      email: user.email,
      authToken,
      refreshToken,
    });
  });

  it('should sign in a user and return tokens', async () => {
    const dto = {
      email: 'john@example.com',
      password: 'password',
    };

    const user = {
      _id: new Types.ObjectId(),
      name: 'John',
      email: dto.email,
      password: 'hashedPassword',
    };

    const payload: IJwtPayload = {
      sub: user._id,
      email: user.email,
    };

    const authToken = 'auth123';
    const refreshToken = 'refresh456';

    mockUserProvider.getByEmail.mockResolvedValue(user as unknown as User);
    mockAuthHelper.compare.mockResolvedValue(true);
    mockAuthHelper.signAuthToken.mockReturnValue(authToken);
    mockAuthHelper.signRefreshToken.mockReturnValue(refreshToken);
    mockUserProvider.userResponse.mockReturnValue({
      name: user.name,
      email: user.email,
      authToken,
      refreshToken,
    });

    const result = await authService.signIn(dto);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUserProvider.getByEmail).toHaveBeenCalledWith(dto.email);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockAuthHelper.compare).toHaveBeenCalledWith(
      dto.password,
      user.password,
    );

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockAuthHelper.signAuthToken).toHaveBeenCalledWith(payload);
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockAuthHelper.signRefreshToken).toHaveBeenCalledWith(payload);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockUserProvider.userResponse).toHaveBeenCalledWith(
      user,
      authToken,
      refreshToken,
    );

    expect(result).toEqual({
      name: user.name,
      email: user.email,
      authToken,
      refreshToken,
    });
  });

  it('should return a new auth token when refreshToken is called', () => {
    const payload: IJwtPayload = {
      sub: new Types.ObjectId(),
      email: 'john@example.com',
    };

    const newAuthToken = 'newAuthToken';

    mockAuthHelper.signAuthToken.mockReturnValue(newAuthToken);

    const result = authService.refreshToken(payload);

    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(mockAuthHelper.signAuthToken).toHaveBeenCalledWith(payload);

    expect(result).toEqual({ authToken: newAuthToken });
  });
});

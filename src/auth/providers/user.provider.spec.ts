import { Model, Types } from 'mongoose';

import { User } from '../schemas/user.schema';
import { IUser } from '../interfaces/user.interface';
import { UserProvider } from './user.provider';

let mockUserModel: Partial<Record<keyof Model<User>, jest.Mock>>;

describe('UserProvider', () => {
  let userProvider: UserProvider;

  beforeEach(() => {
    mockUserModel = {
      create: jest.fn(),
      findOne: jest.fn(),
    };

    userProvider = new UserProvider(mockUserModel as unknown as Model<User>);
  });

  it('should create a new user', async () => {
    const user = {
      _id: new Types.ObjectId(),
      name: 'John',
      email: 'john@example.com',
      password: 'hashedPw',
    };

    (mockUserModel.create as jest.Mock).mockResolvedValue(user);

    const result = await userProvider.create(
      user.name,
      user.email,
      user.password,
    );

    expect(mockUserModel.create).toHaveBeenCalledWith({
      name: user.name,
      email: user.email,
      password: user.password,
    });

    expect(result).toEqual(user);
  });

  it('should return a user by email', async () => {
    const user = {
      _id: new Types.ObjectId(),
      name: 'Jane',
      email: 'jane@example.com',
      password: '123',
    };

    (mockUserModel.findOne as jest.Mock).mockResolvedValue(user);

    const result = await userProvider.getByEmail(user.email);

    expect(mockUserModel.findOne).toHaveBeenCalledWith({ email: user.email });
    expect(result).toEqual(user);
  });

  it('should return user response with optional tokens', () => {
    const user: User = {
      _id: new Types.ObjectId(),
      name: 'Alice',
      email: 'alice@example.com',
      password: 'hidden',
    } as User;

    const authToken = 'auth123';
    const refreshToken = 'refresh456';

    const result = userProvider.userResponse(user, authToken, refreshToken);

    const expected: IUser = {
      name: user.name,
      email: user.email,
      authToken,
      refreshToken,
    };

    expect(result).toEqual(expected);
  });
});

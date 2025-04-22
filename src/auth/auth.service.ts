import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Types } from 'mongoose';

import { UserProvider } from './providers/user.provider';
import { AuthHelper } from './helpers/auth.helper';
import { SignUpDto } from './dtos/sign-up.dto';
import { IUser } from './interfaces/user.interface';
import { IJwtPayload } from './interfaces/jwt-payload.interface';
import { SignInDto } from './dtos/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userProvider: UserProvider,
    private readonly authHelper: AuthHelper,
  ) {}

  async signUp(dto: SignUpDto): Promise<IUser> {
    const hashedPassword = await this.authHelper.hash(dto.password);

    const user = await this.userProvider.create(
      dto.name,
      dto.email,
      hashedPassword,
    );

    const payload: IJwtPayload = {
      sub: user._id as Types.ObjectId,
      email: user.email,
    };
    const authToken = this.authHelper.signAuthToken(payload);
    const refreshToken = this.authHelper.signRefreshToken(payload);

    return this.userProvider.userResponse(user, authToken, refreshToken);
  }

  async signIn(dto: SignInDto): Promise<IUser> {
    const user = await this.userProvider.getByEmail(dto.email);
    if (!user) throw new NotFoundException();

    const checked = await this.authHelper.compare(dto.password, user.password);
    if (!checked) throw new UnauthorizedException();

    const payload: IJwtPayload = {
      sub: user._id as Types.ObjectId,
      email: user.email,
    };
    const authToken = this.authHelper.signAuthToken(payload);
    const refreshToken = this.authHelper.signRefreshToken(payload);

    return this.userProvider.userResponse(user, authToken, refreshToken);
  }

  refreshToken(payload: IJwtPayload): { authToken: string } {
    return { authToken: this.authHelper.signAuthToken(payload) };
  }
}

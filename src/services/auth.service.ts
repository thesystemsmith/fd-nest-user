import {
  Injectable,
  UnauthorizedException,
  InternalServerErrorException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { compare } from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { Model } from 'mongoose';
import { LoginDto } from '../dto/auth/login.dto';
import { User, UserDocument } from '../schemas/user.schema';
import { JwtConfig } from '../config/jwt.config';
import { JwtPayload } from '../types/jwt-payload.type';

export interface LoginResult {
  message: string;
  token: {
    accessToken: string;
    expiresAt: string;
  };
  user: {
    id: string;
    email: string;
    role: UserDocument['role'];
    profile: UserDocument['profile'];
  };
}

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService<{ jwt: JwtConfig }, true>,
  ) {}

  async login(dto: LoginDto): Promise<LoginResult> {
    const normalizedEmail = dto.email.toLowerCase();

    const user = await this.userModel
      .findOne({ email: normalizedEmail })
      .select('+passwordHash')
      .exec();

    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is inactive.');
    }

    const isPasswordValid = await compare(dto.password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const jwtConfig = this.configService.getOrThrow('jwt', { infer: true });

    const payload: JwtPayload = {
      sub: String(user.id),
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload).catch(() => {
      throw new InternalServerErrorException(
        'Failed to generate access token.',
      );
    });

    const expiresAt = new Date(Date.now() + jwtConfig.expiresInMs);

    user.currentSession = {
      accessToken,
      expiresAt,
    };

    await user.save();

    return {
      message: 'Login successful.',
      token: {
        accessToken,
        expiresAt: expiresAt.toISOString(),
      },
      user: {
        id: String(user.id),
        email: user.email,
        role: user.role,
        profile: user.profile,
      },
    };
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtConfig } from '../config/jwt.config';
import { JwtPayload } from '../types/jwt-payload.type';
import { User, UserDocument } from '../schemas/user.schema';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService<{ jwt: JwtConfig }, true>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    const jwtConfig = configService.getOrThrow('jwt', { infer: true });

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), //ignoring eslint for this
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: JwtPayload) {
    const user = await this.userModel.findById(payload.sub).exec();

    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid authentication token.');
    }

    return {
      id: String(user.id),
      email: user.email,
      role: user.role,
    };
  }
}

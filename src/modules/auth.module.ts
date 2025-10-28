import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { User, UserSchema } from '../schemas/user.schema';
import { JwtStrategy } from '../strategies/jwt.strategy';
import { JwtConfig } from '../config/jwt.config';

@Module({
  imports: [
    ConfigModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService<{ jwt: JwtConfig }, true>) => {
        const jwtConfig = configService.getOrThrow('jwt', { infer: true });
        return {
          secret: jwtConfig.secret,
          signOptions: {
            expiresIn: jwtConfig.expiresInSeconds,
          },
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}

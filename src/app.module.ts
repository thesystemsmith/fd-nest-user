import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './modules/users.module';
import { AuthModule } from './modules/auth.module';
import jwtConfig from './config/jwt.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // Makes config available everywhere
      envFilePath: '.env',
      load: [jwtConfig],
    }),
    DatabaseModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}

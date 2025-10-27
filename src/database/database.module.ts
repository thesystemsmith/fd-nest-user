import { Module, Logger } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { getDatabaseConfig } from '../config/database.config';
import type { Connection } from 'mongoose';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      useFactory: () => {
        const { uri } = getDatabaseConfig();

        if (!uri) {
          throw new Error('MongoDB connection uri is not configured.');
        }

        //use nest logger instead of console
        const logger = new Logger('DatabaseModule');
        logger.log(`🔌 Attempting to connect to MongoDB: ${uri}`);

        return {
          uri,
          // Connection event handlers
          connectionFactory: (connection: Connection) => {
            connection.on('connected', () => {
              logger.log('✅ MongoDB connected successfully');
            });

            connection.on('disconnected', () => {
              logger.log('❌ MongoDB disconnected');
            });

            connection.on('error', (error) => {
              logger.error('🔥 MongoDB connection error:', error);
            });

            return connection;
          },
        };
      },
    }),
  ],
  exports: [MongooseModule],
})
export class DatabaseModule {}

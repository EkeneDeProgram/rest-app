// Import the Module decorator from the @nestjs/common package
import { Module, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
// Import the MongooseModule for integrating Mongoose with the NestJS application
import { MongooseModule } from '@nestjs/mongoose';
// Import the ConfigModule for managing environment variables and configuration
import { ConfigModule } from '@nestjs/config';
// Import the UsersModule which contains the logic related to user management
import { UsersModule } from './users/users.module';
import { BodySizeMiddleware } from 'middleware/body-size.middleware';

@Module({
  imports: [
    ConfigModule.forRoot(),
    MongooseModule.forRoot(process.env.MONGO_URI),
    UsersModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(BodySizeMiddleware)
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}

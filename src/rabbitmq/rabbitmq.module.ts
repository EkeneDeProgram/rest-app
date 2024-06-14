// Import the Module decorator from the @nestjs/common package
import { Module } from '@nestjs/common';
// Import the RabbitMQService from the local file rabbitmq.service
import { RabbitMQService } from './rabbitmq.service';

// Use the @Module decorator to define the RabbitMQModule
@Module({
  // Specify the providers that should be instantiated by the NestJS dependency injection system
  providers: [RabbitMQService],
  // Specify the providers that should be exported and available to other modules
  exports: [RabbitMQService],
})
// Define and export the RabbitMQModule class
export class RabbitMQModule {}

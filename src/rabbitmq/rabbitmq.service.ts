// Import the Injectable decorator from the @nestjs/common package
import { Injectable } from '@nestjs/common';

// Import the amqplib package for working with RabbitMQ
import * as amqp from 'amqplib';

// Mark the RabbitMQService class as injectable, allowing it to be managed by the NestJS dependency injection system
@Injectable()
export class RabbitMQService {
  // Define the RabbitMQ URI from environment variables
  private readonly url = process.env.RABBITMQ_URI;

  // Define an asynchronous method to publish messages to a RabbitMQ queue
  async publish(queue: string, message: any) {
    // Declare connection and channel variables to be used within the method
    let connection: amqp.Connection | null = null;
    let channel: amqp.Channel | null = null;

    try {
      // Establish a connection to the RabbitMQ server
      connection = await amqp.connect(this.url);
      // Create a channel for communication with the RabbitMQ server
      channel = await connection.createChannel();
      // Assert that the specified queue exists, creating it if necessary
      await channel.assertQueue(queue, { durable: true });
      // Send the message to the specified queue, converting it to a Buffer and serializing it as JSON
      channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));

      // Schedule the closing of the channel and connection after a delay of 500ms
      setTimeout(async () => {
        try {
          // Close the channel if it exists
          if (channel) await channel.close();
          // Close the connection if it exists
          if (connection) await connection.close();
        } catch (closeError) {
          // Log any errors that occur while closing the channel or connection
          console.error('Error closing channel or connection', closeError);
        }
      }, 500);
    } catch (error) {
      // Log any errors that occur during the publish process
      console.error('Error publishing message', error);

      // Attempt to close the channel and connection in case of an error
      try {
        // Close the channel if it exists
        if (channel) await channel.close();
        // Close the connection if it exists
        if (connection) await connection.close();
      } catch (closeError) {
        // Log any errors that occur while closing the channel or connection after a failure
        console.error(
          'Error closing channel or connection after failure',
          closeError,
        );
      }
    }
  }
}

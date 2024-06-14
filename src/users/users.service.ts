// Import the Injectable and HttpService decorators from the @nestjs/common package
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
// Import the UsersRepository class from the users.repository file
import { UsersRepository } from './users.repository';
// Import the RabbitMQService class from the rabbitmq.service file
import { RabbitMQService } from '../rabbitmq/rabbitmq.service';
// Import the fs (file system) module from Node.js for file operations
import * as fs from 'fs';
// Import the crypto module from Node.js for hashing
import * as crypto from 'crypto';
import * as path from 'path';
import { User } from './schemas/user.schema';

// Mark the UsersService class as injectable, allowing it to be managed by the NestJS dependency injection system
@Injectable()
export class UsersService {
  private readonly avatarDirectory = path.join(
    __dirname,
    '..',
    '..',
    'avatars',
  );

  // Use the constructor to inject the UsersRepository, HttpService, and RabbitMQService
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly httpService: HttpService,
    private readonly rabbitMQService: RabbitMQService,
  ) {
    // Ensure the avatar directory exists
    if (!fs.existsSync(this.avatarDirectory)) {
      fs.mkdirSync(this.avatarDirectory, { recursive: true });
    }
  }

  // Define an asynchronous method to create a new user with the given email
  async createUser(email: string): Promise<User> {
    const newUser = await this.usersRepository.createUser(email);
    await this.rabbitMQService.publish('user_created', { email });
    // Dummy email sending can be implemented here
    console.log(`Email sent to ${email}`);
    return newUser;
  }

  // Define an asynchronous method to retrieve a user by their ID from an external API
  async getUser(userId: string): Promise<any> {
    try {
      // Make a GET request to the external API to retrieve the user data
      const response = await this.httpService
        .get(`https://reqres.in/api/users/${userId}`)
        .toPromise();

      // Check if the user data is not found
      if (!response.data.data) {
        throw new NotFoundException('User not found');
      }

      return response.data.data; // Return the user data from the response
    } catch (error) {
      // Handle potential errors during the API request
      if (error.response && error.response.status === 404) {
        throw new NotFoundException('User not found');
      }

      throw new InternalServerErrorException(
        'Failed to retrieve user data from external API',
      );
    }
  }

  // Method to fetch user avatar
  async getUserAvatar(userId: string): Promise<string> {
    try {
      // Check MongoDB for an entry with the userId
      let user;
      try {
        user = await this.usersRepository.findUserById(userId);
      } catch (err) {
        // Log the error and proceed to fetch from external API
        console.error(
          'User not found locally, fetching from external API:',
          err.message,
        );
      }

      // Return the base64-encoded representation from the database if found
      if (user && user.avatar) {
        return user.avatar;
      }

      // User not found locally, fetch user data from the external API
      const userData = await this.getUser(userId);
      if (!userData || !userData.avatar) {
        throw new NotFoundException('User not found');
      }

      const avatarUrl = userData.avatar;

      // Fetch the image from the avatar URL
      const response = await this.httpService
        .get(avatarUrl, { responseType: 'arraybuffer' })
        .toPromise();
      if (response.status !== 200) {
        throw new InternalServerErrorException(
          'Failed to fetch avatar image from external API',
        );
      }

      // Generate a unique file name and save the image as a file
      const avatarHash = crypto
        .createHash('md5')
        .update(response.data)
        .digest('hex');
      const avatarFileName = `${userId}-${avatarHash}.jpg`;
      const avatarFilePath = path.join(this.avatarDirectory, avatarFileName);
      fs.writeFileSync(avatarFilePath, response.data);

      // Convert the image data to a base64 string
      const base64Avatar = response.data.toString('base64');

      // Update the user's avatar file path and base64 representation in the database
      await this.usersRepository.updateUserAvatar(
        userId,
        base64Avatar,
        avatarHash,
      );

      return base64Avatar; // Return the base64-encoded avatar
    } catch (error) {
      // Handle potential NotFoundException from getUser method
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Log the error and throw an InternalServerErrorException for other errors
      console.error(
        'Failed to retrieve user avatar:',
        error.message,
        error.stack,
      );
      throw new InternalServerErrorException('Failed to retrieve user avatar');
    }
  }

  // Define an asynchronous method to delete a user's avatar by their ID
  // async deleteUserAvatar(userId: string): Promise<void> {
  //   try {
  //     // Find the user by their ID using the UsersRepository
  //     const user = await this.usersRepository.findUserById(userId);
  //     if (user && user.avatarHash) {
  //       console.log(`Deleting avatar for user ${userId}`);
  //       // Construct the file path
  //       const avatarFilePath = path.join(
  //         './avatars',
  //         `${userId}-${user.avatarHash}.jpg`,
  //       );

  //       // Check if the file exists before attempting to delete
  //       if (fs.existsSync(avatarFilePath)) {
  //         try {
  //           // Delete the avatar image file from the file system
  //           fs.unlinkSync(avatarFilePath);
  //           console.log(`Deleted avatar file: ${avatarFilePath}`);
  //         } catch (error) {
  //           console.error(
  //             `Failed to delete file: ${avatarFilePath}`,
  //             error.message,
  //           );
  //         }
  //       }

  //       // Remove the avatar and avatar hash from the user's record in the database
  //       await this.usersRepository.deleteUserAvatar(userId);
  //       console.log(`Removed avatar data for user ${userId} in database`);
  //     } else {
  //       console.log(`No avatar found for user ${userId}`);
  //     }
  //   } catch (error) {
  //     console.error(
  //       'Failed to delete user avatar:',
  //       error.message,
  //       error.stack,
  //     );
  //     // Handle potential errors during the avatar deletion process
  //     throw new InternalServerErrorException('Failed to delete user avatar');
  //   }
  // }
  async deleteUserAvatar(userId: string): Promise<void> {
    try {
      // Find the user by their ID using the UsersRepository
      const user = await this.usersRepository.findUserById(userId);

      if (!user) {
        // Throw NotFoundException if the user is not found
        throw new NotFoundException('User not found');
      }

      if (user.avatarHash) {
        console.log(`Deleting avatar for user ${userId}`);

        // Construct the file path
        const avatarFilePath = path.join(
          './avatars',
          `${userId}-${user.avatarHash}.jpg`,
        );

        // Check if the file exists before attempting to delete
        if (fs.existsSync(avatarFilePath)) {
          try {
            // Delete the avatar image file from the file system
            fs.unlinkSync(avatarFilePath);
            console.log(`Deleted avatar file: ${avatarFilePath}`);
          } catch (error) {
            console.error(
              `Failed to delete file: ${avatarFilePath}`,
              error.message,
            );
          }
        }

        // Remove the avatar and avatar hash from the user's record in the database
        await this.usersRepository.deleteUserAvatar(userId);
        console.log(`Removed avatar data for user ${userId} in database`);
      } else {
        console.log(`No avatar found for user ${userId}`);
      }
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error(
        'Failed to delete user avatar:',
        error.message,
        error.stack,
      );

      // Handle potential errors during the avatar deletion process
      throw new InternalServerErrorException('Failed to delete user avatar');
    }
  }
}

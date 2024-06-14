// Import necessary decorators and modules from the @nestjs/common package
import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// Import the UsersService class from the users.service file
import { UsersService } from './users.service';

// Define the UsersController class and specify the base route as 'api/users'
@Controller('api/users')
export class UsersController {
  // Use the constructor to inject the UsersService
  constructor(private readonly usersService: UsersService) {}

  // Define a POST route to create a new user
  @Post()
  async createUser(@Body('email') email: string) {
    return this.usersService.createUser(email);
  }

  // Define a GET route to retrieve a user by their ID
  @Get(':userId')
  async getUser(@Param('userId') userId: string) {
    try {
      // Call the getUser method from UsersService with the provided userId
      const user = await this.usersService.getUser(userId);
      return user;
    } catch (error) {
      // Handle potential errors during user retrieval
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to retrieve user');
    }
  }

  // Define a GET route to retrieve a user's avatar by their ID
  @Get(':userId/avatar')
  async getUserAvatar(@Param('userId') userId: string): Promise<string> {
    try {
      // Call the getUserAvatar method from UsersService with the provided userId
      return await this.usersService.getUserAvatar(userId);
    } catch (error) {
      // Handle potential NotFoundException from the service
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Handle other errors during user avatar retrieval
      throw new InternalServerErrorException('Failed to retrieve user avatar');
    }
  }

  // Define a DELETE route to delete a user's avatar by their ID
  // @Delete(':userId/avatar')
  // async deleteUserAvatar(@Param('userId') userId: string) {
  //   try {
  //     await this.usersService.deleteUserAvatar(userId);
  //     return { message: 'User avatar deleted successfully' };
  //   } catch (error) {
  //     throw new InternalServerErrorException('Failed to delete user avatar');
  //   }
  // }
  @Delete(':userId/avatar')
  async deleteUserAvatar(@Param('userId') userId: string) {
    try {
      await this.usersService.deleteUserAvatar(userId);
      return { message: 'User avatar deleted successfully' };
    } catch (error) {
      // Handle potential NotFoundException from the service
      if (error instanceof NotFoundException) {
        throw error;
      }

      // Handle other errors during avatar deletion
      throw new InternalServerErrorException('Failed to delete user avatar');
    }
  }
}

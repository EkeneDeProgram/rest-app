// Import the Injectable decorator from the @nestjs/common package
import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
// Import the InjectModel decorator from the @nestjs/mongoose package
import { InjectModel } from '@nestjs/mongoose';
// Import the Model class from the mongoose package
import { Model } from 'mongoose';
// Import the User interface from the user.schema file
import { User } from './schemas/user.schema';

// Mark the UsersRepository class as injectable, allowing it to be managed by the NestJS dependency injection system
@Injectable()
export class UsersRepository {
  // Use the constructor to inject the User model
  constructor(@InjectModel('User') private readonly userModel: Model<User>) {}

  // Define an asynchronous method to create a new user with the given email
  async createUser(email: string): Promise<User> {
    const newUser = new this.userModel({ email });
    return await newUser.save();
  }

  async findUserById(userId: string): Promise<User | null> {
    try {
      return await this.userModel.findOne({ userId }).exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to find user by ID');
    }
  }

  async updateUserAvatar(
    userId: string,
    avatar: string,
    avatarHash: string,
  ): Promise<User | null> {
    try {
      console.log('Updating user avatar for userId:', userId);

      const updatedUser = await this.userModel
        .findOneAndUpdate(
          { userId }, // Use userId to identify the document
          { avatar, avatarHash },
          { new: true, upsert: true },
        )
        .exec();

      if (!updatedUser) {
        throw new NotFoundException(`User with ID ${userId} not found`);
      }

      return updatedUser;
    } catch (error) {
      console.error('Error updating user avatar:', error);
      throw new InternalServerErrorException('Failed to update user avatar');
    }
  }

  // Define an asynchronous method to delete a user's avatar and avatar hash
  async deleteUserAvatar(userId: string): Promise<User | null> {
    try {
      return await this.userModel
        .findOneAndUpdate(
          { userId },
          { $unset: { avatar: '', avatarHash: '' } },
          { new: true },
        )
        .exec();
    } catch (error) {
      throw new InternalServerErrorException('Failed to delete user avatar');
    }
  }
}

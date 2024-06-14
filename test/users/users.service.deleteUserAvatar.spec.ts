import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { UsersRepository } from '../../src/users/users.repository';
import { RabbitMQService } from '../../src/rabbitmq/rabbitmq.service';
import { HttpService } from '@nestjs/axios';
import * as fs from 'fs';
import * as path from 'path';

// Mock dependencies
const mockUsersRepository = {
  findUserById: jest.fn(),
  deleteUserAvatar: jest.fn(),
};
const mockRabbitMQService = {};
const mockHttpService = {};

// Mock fs module
jest.mock('fs');

describe('UsersService - deleteUserAvatar', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: UsersRepository, useValue: mockUsersRepository },
        { provide: RabbitMQService, useValue: mockRabbitMQService },
        { provide: HttpService, useValue: mockHttpService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('deleteUserAvatar', () => {
    it('should delete the avatar file and update the database if the avatar exists', async () => {
      const userId = '1';
      const avatarHash = 'somehash';
      const user = { avatarHash };
      const avatarFilePath = path.join(
        './avatars',
        `${userId}-${avatarHash}.jpg`,
      );

      // Mock the repository method to return a user with an avatarHash
      mockUsersRepository.findUserById.mockResolvedValue(user);
      // Mock fs.existsSync to return true, indicating the file exists
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock fs.unlinkSync to simulate file deletion
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {});

      await service.deleteUserAvatar(userId);

      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(fs.existsSync).toHaveBeenCalledWith(avatarFilePath);
      expect(fs.unlinkSync).toHaveBeenCalledWith(avatarFilePath);
      expect(mockUsersRepository.deleteUserAvatar).toHaveBeenCalledWith(userId);
    });

    it('should handle file deletion errors gracefully', async () => {
      const userId = '1';
      const avatarHash = 'somehash';
      const user = { avatarHash };
      const avatarFilePath = path.join(
        './avatars',
        `${userId}-${avatarHash}.jpg`,
      );

      // Mock the repository method to return a user with an avatarHash
      mockUsersRepository.findUserById.mockResolvedValue(user);
      // Mock fs.existsSync to return true, indicating the file exists
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      // Mock fs.unlinkSync to throw an error
      (fs.unlinkSync as jest.Mock).mockImplementation(() => {
        throw new Error('Failed to delete file');
      });

      await service.deleteUserAvatar(userId);

      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(fs.existsSync).toHaveBeenCalledWith(avatarFilePath);
      expect(fs.unlinkSync).toHaveBeenCalledWith(avatarFilePath);
      expect(mockUsersRepository.deleteUserAvatar).toHaveBeenCalledWith(userId);
    });
  });
});

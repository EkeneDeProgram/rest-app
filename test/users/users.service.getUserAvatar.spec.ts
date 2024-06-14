import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from '../../src/users/users.service';
import { UsersRepository } from '../../src/users/users.repository';
import { RabbitMQService } from '../../src/rabbitmq/rabbitmq.service';
import { HttpService } from '@nestjs/axios';
import { of, throwError } from 'rxjs';
import {
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

// Mock dependencies
const mockUsersRepository = {
  findUserById: jest.fn(),
  updateUserAvatar: jest.fn(),
};
const mockRabbitMQService = {};
const mockHttpService = {
  get: jest.fn(),
};

describe('UsersService - getUserAvatar', () => {
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

  describe('getUserAvatar', () => {
    it('should return the avatar from the local repository if it exists', async () => {
      const userId = '1';
      const base64Avatar = 'base64encodedavatar';

      // Mock the repository method
      mockUsersRepository.findUserById.mockResolvedValue({
        avatar: base64Avatar,
      });

      const result = await service.getUserAvatar(userId);

      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(result).toEqual(base64Avatar);
    });

    it('should fetch the avatar from the external API if not found locally', async () => {
      const userId = '1';
      const externalAvatarUrl = 'https://reqres.in/img/faces/1-image.jpg';
      const base64Avatar = Buffer.from('avatarimagebuffer').toString('base64');
      const userData = { data: { avatar: externalAvatarUrl } };
      const avatarResponse = {
        status: 200,
        data: Buffer.from('avatarimagebuffer'),
      };

      // Mock the repository method to return null
      mockUsersRepository.findUserById.mockResolvedValue(null);
      mockHttpService.get
        .mockReturnValueOnce(of({ data: userData })) // External API for user data
        .mockReturnValueOnce(of(avatarResponse)); // External API for avatar image

      const result = await service.getUserAvatar(userId);

      expect(mockUsersRepository.findUserById).toHaveBeenCalledWith(userId);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(externalAvatarUrl, {
        responseType: 'arraybuffer',
      });
      expect(result).toEqual(base64Avatar);
    });

    it('should throw NotFoundException if user is not found in the external API', async () => {
      const userId = '1';

      // Mock the repository method to return null
      mockUsersRepository.findUserById.mockResolvedValue(null);
      // Mock the HTTP GET request to return 404 error
      mockHttpService.get.mockReturnValueOnce(
        throwError(() => {
          const error: any = new Error('Request failed');
          error.response = { status: 404 };
          return error;
        }),
      );

      await expect(service.getUserAvatar(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
    });

    it('should throw an InternalServerErrorException if the external API request fails', async () => {
      const userId = '1';

      // Mock the repository method to return null
      mockUsersRepository.findUserById.mockResolvedValue(null);
      // Mock the HTTP GET request to throw an error
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Request failed')),
      );

      await expect(service.getUserAvatar(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
    });
  });
});

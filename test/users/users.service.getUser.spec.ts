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
const mockUsersRepository = {};
const mockRabbitMQService = {};
const mockHttpService = {
  get: jest.fn(),
};

describe('UsersService - getUser', () => {
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

  describe('getUser', () => {
    it('should retrieve user data successfully', async () => {
      const userId = '1';
      const userData = { data: { id: userId, email: 'test@example.com' } };

      // Mock the HTTP GET request
      mockHttpService.get.mockReturnValue(of({ data: userData }));

      const result = await service.getUser(userId);

      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
      expect(result).toEqual(userData.data);
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const userId = '999';

      // Mock the HTTP GET request to return a 404 status
      mockHttpService.get.mockReturnValue(
        throwError({
          response: { status: 404 },
        }),
      );

      await expect(service.getUser(userId)).rejects.toThrow(NotFoundException);
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
    });

    it('should throw an InternalServerErrorException when the HTTP request fails', async () => {
      const userId = '1';

      // Mock the HTTP GET request to throw an error
      mockHttpService.get.mockReturnValue(
        throwError(() => new Error('Request failed')),
      );

      await expect(service.getUser(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(mockHttpService.get).toHaveBeenCalledWith(
        `https://reqres.in/api/users/${userId}`,
      );
    });
  });
});

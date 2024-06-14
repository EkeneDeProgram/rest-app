import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import {
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { User } from '../../src/users/schemas/user.schema';

describe('UsersController', () => {
  let usersController: UsersController;
  let usersService: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            getUser: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getUser', () => {
    it('should return a user if found', async () => {
      const userId = 'userId';
      const user: User = {
        _id: 'someId',
        email: 'test@example.com',
        userId: 'userId',
      } as User;

      jest.spyOn(usersService, 'getUser').mockResolvedValue(user);

      const result = await usersController.getUser(userId);

      expect(result).toEqual(user);
      expect(usersService.getUser).toHaveBeenCalledWith(userId);
    });

    it('should throw NotFoundException if user is not found', async () => {
      const userId = 'nonExistentUserId';

      jest
        .spyOn(usersService, 'getUser')
        .mockRejectedValue(new NotFoundException('User not found'));

      await expect(usersController.getUser(userId)).rejects.toThrow(
        NotFoundException,
      );
      expect(usersService.getUser).toHaveBeenCalledWith(userId);
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const userId = 'userId';

      jest.spyOn(usersService, 'getUser').mockImplementation(() => {
        throw new Error('Some error');
      });

      await expect(usersController.getUser(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(usersService.getUser).toHaveBeenCalledWith(userId);
    });
  });
});

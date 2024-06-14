import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { InternalServerErrorException } from '@nestjs/common';

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
            deleteUserAvatar: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('deleteUserAvatar', () => {
    it('should delete the avatar for a given user ID', async () => {
      const userId = 'userId';

      await usersController.deleteUserAvatar(userId);

      expect(usersService.deleteUserAvatar).toHaveBeenCalledWith(userId);
    });

    it('should return a success message upon successful deletion', async () => {
      const userId = 'userId';

      const result = await usersController.deleteUserAvatar(userId);

      expect(result).toEqual({ message: 'User avatar deleted successfully' });
    });

    it('should throw InternalServerErrorException if an error occurs', async () => {
      const userId = 'userId';

      jest
        .spyOn(usersService, 'deleteUserAvatar')
        .mockRejectedValue(new Error('Some error'));

      await expect(usersController.deleteUserAvatar(userId)).rejects.toThrow(
        InternalServerErrorException,
      );
      expect(usersService.deleteUserAvatar).toHaveBeenCalledWith(userId);
    });
  });
});

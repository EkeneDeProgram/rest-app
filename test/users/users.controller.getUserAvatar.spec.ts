import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
import { NotFoundException } from '@nestjs/common';

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
            getUserAvatar: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('getUserAvatar', () => {
    it('should return the avatar URL for a given user ID', async () => {
      const userId = 'userId';
      const avatarUrl = 'http://example.com/avatar.jpg';

      jest.spyOn(usersService, 'getUserAvatar').mockResolvedValue(avatarUrl);

      const result = await usersController.getUserAvatar(userId);

      expect(result).toEqual(avatarUrl);
      expect(usersService.getUserAvatar).toHaveBeenCalledWith(userId);
    });
  });

  it('should throw NotFoundException if the user is not found', async () => {
    const userId = 'nonExistentUserId';

    jest
      .spyOn(usersService, 'getUserAvatar')
      .mockRejectedValue(new NotFoundException('User not found'));

    await expect(usersController.getUserAvatar(userId)).rejects.toThrow(
      NotFoundException,
    );
    expect(usersService.getUserAvatar).toHaveBeenCalledWith(userId);
  });
});

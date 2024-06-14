import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from '../../src/users/users.controller';
import { UsersService } from '../../src/users/users.service';
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
            createUser: jest.fn(),
          },
        },
      ],
    }).compile();

    usersController = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const createUserDto = {
        email: 'test@example.com',
      };

      const result: User = {
        _id: 'someId',
        email: 'test@example.com',
        userId: 'userId',
        id: 'someId', // Assuming that `id` is the same as `_id` or is generated similarly
      } as User;

      jest.spyOn(usersService, 'createUser').mockResolvedValue(result);

      const createdUser = await usersController.createUser(createUserDto.email);

      expect(createdUser).toEqual(result);
      expect(usersService.createUser).toHaveBeenCalledWith(createUserDto.email);
    });
  });
});

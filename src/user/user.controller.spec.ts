import { Test, TestingModule } from '@nestjs/testing';
import { Request } from 'express';
import { CreateUserDto } from './dto/create-user.dto';
import { UserDocument } from './schemas/user.schema';
import { UserController } from './user.controller';
import { UserService } from './user.service';

describe('UserController', () => {
  let controller: UserController;
  let userService: Partial<UserService>

  const user = {
    _id: 1,
    name: 'Vitor'
  }

  beforeEach(async () => {

    userService = {
      create: () => Promise.resolve(user as UserDocument)
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [{
        provide: UserService,
        useValue: userService
      }]
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  it('Must be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Must create a session during user creation', async () => {
    const session = {userId: null}
    await controller.create(session, {} as CreateUserDto)
    expect(session.userId).toBe(user._id)
  })

});

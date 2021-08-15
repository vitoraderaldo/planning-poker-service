import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let userRepository: Partial<UserRepository>

  beforeEach(async () => {

    userRepository = {
      create: (userDto: CreateUserDto) => null,
      save: () => {},
      get: (id: string) => null
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: userRepository
        }
      ]
    }).compile();
    service = module.get<UserService>(UserService);
  });

  it('Must be defined', () => {
    expect(service).toBeDefined();
  });
});

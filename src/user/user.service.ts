import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserRepository } from './repositories/user.repository';

@Injectable()
export class UserService {

    constructor(
        private userRepository: UserRepository
    ) {}

    get(id: string) {
        return this.userRepository.get(id)
    }

    create(userDto: CreateUserDto) {
        const user = this.userRepository.create(userDto)
        return this.userRepository.save(user)
    }
}

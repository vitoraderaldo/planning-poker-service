import { INestApplication } from '@nestjs/common';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as request from 'supertest';

export const createUserDto = {
    name: 'name'
} as CreateUserDto

export const createUser = (app: INestApplication, user: CreateUserDto) => {
    return request(app.getHttpServer())
      .post('/user')
      .send(user)
}

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from './../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import {createUser, createUserDto} from './Util-spec'
import { ViewUserDto } from 'src/user/dto/view-user.dto';

describe('User', () => {
  let app: INestApplication;
  let connection: Connection;

  beforeEach(async () => {

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule]
    }).compile();

    app = moduleFixture.createNestApplication();
    connection = await moduleFixture.get(getConnectionToken());
    await app.init();
  });

  afterEach(async () => {
    await connection.dropDatabase()
    await connection.close(true);
  });

  it('Create User', async () => {
    await createUser(app, createUserDto)
      .expect(201)
      .then((res) => {
        const {id, name}: ViewUserDto = res.body
        const fields: string[] = Object.keys(res.body)
        expect(fields).toStrictEqual(['id', 'name'])
        expect(id).toBeDefined()
        expect(name).toEqual(createUserDto.name)
      })
  });

  it('Must not create User with invalid data', async () => {
    await createUser(app, null)
      .expect(400)
  });

  it('Must not create user again', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    await createUser(app, createUserDto)
          .set('Cookie', cookie)
          .expect(403)
  })


});

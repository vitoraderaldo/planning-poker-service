import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import {createUser, createPlanning, createUserDto, getUserFromCookie} from './Util-spec'
import { CreatePlanningDto } from '../src/planning/dto/create-planning.dto';
import { ViewPlanningDto } from 'src/planning/dto/view-planning.dto';

describe('Create Planning', () => {
  let app: INestApplication;
  let connection: Connection;
  const planning = {
    name: 'planning name'
  } as CreatePlanningDto

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

  it('Must not create planning without an account', async () => {
    await createPlanning(app, planning)
        .expect(403)
  })

  it('Must not create planning with invalid data', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')

    await createPlanning(app, null)
        .set('Cookie', cookie)
        .expect(400)
  })

  it('Must create planning when user is logged and data is valid', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    const cookieUser = getUserFromCookie(cookie)
    await createPlanning(app, planning)
        .set('Cookie', cookie)
        .expect(201)
        .then((res) => {
            const fields = Object.keys(res.body)
            const {id, name, revealed, createdBy, createdAt, updatedAt, voters}: ViewPlanningDto = res.body
            expect(fields).toStrictEqual(['id', 'name', 'revealed', 'createdBy', 'createdAt', 'updatedAt', 'voters'])
            expect(id).toBeDefined()
            expect(name).toStrictEqual(planning.name)
            expect(revealed).toStrictEqual(false)
            expect(voters).toStrictEqual([])
            expect(createdAt).toBeDefined()
            expect(updatedAt).toBeDefined()
            expect(Object.keys(createdBy)).toStrictEqual(['id', 'name'])
            expect(createdBy.id).toStrictEqual(cookieUser.userId)
            expect(createdBy.name).toStrictEqual(createUserDto.name)
        })
  })
});

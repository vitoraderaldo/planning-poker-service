import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import {createUser, createPlanning, getPlanning, createUserDto, getUserFromCookie} from './Util-spec'
import { CreatePlanningDto } from '../src/planning/dto/create-planning.dto';
import { ViewPlanningDto } from 'src/planning/dto/view-planning.dto';
var mongoose = require('mongoose');

describe('Get Planning', () => {
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

  it('Must not get a planning without an account', async () => {
    await getPlanning(app, mongoose.Types.ObjectId())
        .expect(403)
  })

  it('Must not get a planning without and ID', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    await getPlanning(app, null)
        .set('Cookie', cookie)
        .expect(404)
  })

  it('Must not get a planning with invalid ID', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    await getPlanning(app, 'invalid_id')
        .set('Cookie', cookie)
        .expect(404)
  })

  it('Must not get planning when it does not exist', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    await getPlanning(app, mongoose.Types.ObjectId())
        .set('Cookie', cookie)
        .expect(404)
  })

  it('Must get planning that exists', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    const cookieUser = getUserFromCookie(cookie)
    const initialPlanning: ViewPlanningDto = (await (createPlanning(app, planning).set('Cookie', cookie))).body

    const request = await getPlanning(app, initialPlanning.id)
        .set('Cookie', cookie)
        .expect(200)

    const receivedPlanning = request.body

    expect(receivedPlanning.id).toBeDefined()
    expect(receivedPlanning.name).toBe(planning.name)
    expect(receivedPlanning.revealed).toBeDefined()
    expect(receivedPlanning.createdBy.id).toBe(cookieUser.userId)
    expect(receivedPlanning.createdBy.name).toBeDefined()
    expect(receivedPlanning.createdAt).toBeDefined()
    expect(receivedPlanning.updatedAt).toBeDefined()
    expect(receivedPlanning.voters.length).toBeDefined()
  })

});

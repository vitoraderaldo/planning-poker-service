import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import {createUser, createPlanning, revealPlanning, createUserDto, getUserFromCookie} from './Util-spec'
import { CreatePlanningDto } from '../src/planning/dto/create-planning.dto';
var mongoose = require('mongoose');

describe('Reveal Votes', () => {
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

  it('Must not reveal a planning without an account', async () => {
    await revealPlanning(app, mongoose.Types.ObjectId())
        .expect(403)
  })

  it('Must not reveal a planning without an ID', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    await revealPlanning(app, 'invalid_id')
        .set('Cookie', cookie)
        .expect(404)
  })

  it('Must not reveal when the planning does not exist', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    await revealPlanning(app, mongoose.Types.ObjectId())
        .set('Cookie', cookie)
        .expect(404)
  })

  it('Non-Creator must not reveal the planning', async () => {
    await revealPlanning(app, mongoose.Types.ObjectId())
        .expect(403)
  })

  it('Creator must reveal the planning', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    const cookieUser = getUserFromCookie(cookie)
    const initialPlanning = (await (createPlanning(app, planning).set('Cookie', cookie))).body

    const request = await revealPlanning(app, initialPlanning.id)
        .set('Cookie', cookie)
        .expect(200)

    const finalPlanning = request.body

    expect(finalPlanning.id).toBe(initialPlanning.id)
    expect(finalPlanning.name).toBe(initialPlanning.name)
    expect(finalPlanning.revelead).toBe(true)
    expect(finalPlanning.createdBy.id).toBe(cookieUser.userId)
    expect(finalPlanning.voters.length).toBe(0)
    expect(finalPlanning.createdAt).toBe(initialPlanning.createdAt)
    expect(Date.parse(finalPlanning.updatedAt)).toBeGreaterThan(Date.parse(finalPlanning.createdAt))
  })
});

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import {createUser, createPlanning, voteOnPlanning, createUserDto, getUserFromCookie, revealPlanning} from './Util-spec'
import { CreatePlanningDto } from '../src/planning/dto/create-planning.dto';
var mongoose = require('mongoose');

describe('Vote Planning', () => {
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

  it('Must not vote on a planning without an account', async () => {
    await voteOnPlanning(app, mongoose.Types.ObjectId(), {value: 3})
        .expect(403)
  })

  it('Must not vote on a planning without an ID', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    await voteOnPlanning(app, 'invalid_id', {value: 3})
        .set('Cookie', cookie)
        .expect(404)
  })

  it('Must not vote with invalid data', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    await voteOnPlanning(app, mongoose.Types.ObjectId(), null)
        .set('Cookie', cookie)
        .expect(400)
  })

  it('Must not vote when the planning does not exist', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    await voteOnPlanning(app, mongoose.Types.ObjectId(), {value: 3})
        .set('Cookie', cookie)
        .expect(404)
  })


  it('Must vote for the first time', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    const cookieUser = getUserFromCookie(cookie)
    const initialPlanning = (await (createPlanning(app, planning).set('Cookie', cookie))).body

    await voteOnPlanning(app, initialPlanning.id, {value: 3})
      .set('Cookie', cookie)
      .expect(200)

    const request = await revealPlanning(app, initialPlanning.id)
      .set('Cookie', cookie)
      .expect(200)

    const finalPlanning = request.body
    const votedUser = finalPlanning.voters[0]

    expect(initialPlanning.id).toBe(finalPlanning.id)
    expect(initialPlanning.name).toBe(finalPlanning.name)
    expect(initialPlanning.createdBy.id).toBe(finalPlanning.createdBy.id)
    expect(initialPlanning.createdBy.name).toBe(finalPlanning.createdBy.name)
    expect(initialPlanning.createdAt).toBe(finalPlanning.createdAt)
    expect(Date.parse(initialPlanning.updatedAt)).toBeLessThan(Date.parse(finalPlanning.updatedAt))
    expect(Date.parse(finalPlanning.createdAt)).toBeLessThan(Date.parse(finalPlanning.updatedAt))
    expect(finalPlanning.voters.length).toBe(1)
    expect(votedUser.value).toBe(3)
    expect(votedUser.user.id).toBe(cookieUser.userId)
  })

  it('Must be able to change the vote', async () => {
    const response = await createUser(app, createUserDto)
    const cookie = response.get('Set-Cookie')
    const cookieUser = getUserFromCookie(cookie)
    const initialPlanning = (await (createPlanning(app, planning).set('Cookie', cookie))).body
    await voteOnPlanning(app, initialPlanning.id, {value: 3}).set('Cookie', cookie)
    await voteOnPlanning(app, initialPlanning.id, {value: 5})
      .set('Cookie', cookie)

    const request = await revealPlanning(app, initialPlanning.id)
      .set('Cookie', cookie)
      .expect(200)

    const finalPlanning = request.body
    const votedUser = finalPlanning.voters[0]

    expect(finalPlanning.id).toBe(initialPlanning.id)
    expect(finalPlanning.name).toBe(initialPlanning.name)
    expect(finalPlanning.createdBy.id).toBe(initialPlanning.createdBy.id)
    expect(finalPlanning.createdBy.name).toBe(initialPlanning.createdBy.name)
    expect(finalPlanning.createdAt).toBe(initialPlanning.createdAt)
    expect(Date.parse(finalPlanning.updatedAt)).toBeGreaterThan(Date.parse(initialPlanning.updatedAt))
    expect(Date.parse(finalPlanning.createdAt)).toBeLessThan(Date.parse(finalPlanning.updatedAt))
    expect(finalPlanning.voters.length).toBe(1)
    expect(votedUser.value).toBe(5)
    expect(votedUser.user.id).toBe(cookieUser.userId)
  })



});

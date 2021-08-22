import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { Connection } from 'mongoose';
import { getConnectionToken } from '@nestjs/mongoose';
import {createUser, createPlanning, revealPlanning, createUserDto, getUserFromCookie, voteOnPlanning, getPlanning} from './Util-spec'
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
    expect(finalPlanning.revealed).toBe(true)
    expect(finalPlanning.createdBy.id).toBe(cookieUser.userId)
    expect(finalPlanning.voters.length).toBe(0)
    expect(finalPlanning.createdAt).toBe(initialPlanning.createdAt)
    expect(Date.parse(finalPlanning.updatedAt)).toBeGreaterThan(Date.parse(finalPlanning.createdAt))
  })

  it('Other users must not see the value of other voters when it is unrevealed', async () => {

    // User that will create the Planning
    const user1 = await createUser(app, createUserDto)
    const cookie1 = user1.get('Set-Cookie')

    // User that will vote on a Planning
    const user2 = await createUser(app, createUserDto)
    const cookie2 = user2.get('Set-Cookie')

    // User that will access the planning
    const user3 = await createUser(app, createUserDto)
    const cookie3 = user3.get('Set-Cookie')

    // User 1 creates the planning
    const createdPlanning = (await (createPlanning(app, planning).set('Cookie', cookie1))).body

    // User 2 votes on the planning
    await voteOnPlanning(app, createdPlanning.id, {value: 5})
      .set('Cookie', cookie2)

    const user1Request = await getPlanning(app, createdPlanning.id)
      .set('Cookie', cookie1)
      .expect(200)

    const user2Request = await getPlanning(app, createdPlanning.id)
      .set('Cookie', cookie2)
      .expect(200)

    const user3Request = await getPlanning(app, createdPlanning.id)
      .set('Cookie', cookie3)
      .expect(200)

    const user1View = user1Request.body
    const user2View = user2Request.body
    const user3View = user3Request.body

    expect(user1View.voters[0].value).toBe(null)
    expect(user2View.voters[0].value).toBe(5)
    expect(user3View.voters[0].value).toBe(null)
  })
});

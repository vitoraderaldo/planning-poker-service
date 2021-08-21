import { INestApplication } from '@nestjs/common';
import { CreatePlanningDto } from 'src/planning/dto/create-planning.dto';
import { VotePlanningDto } from 'src/planning/dto/vote-planning.dto';
import { CreateUserDto } from 'src/user/dto/create-user.dto';
import * as request from 'supertest';

export const createUserDto = {
    name: 'user name'
} as CreateUserDto

export const createUser = (app: INestApplication, user: CreateUserDto) => {
    return request(app.getHttpServer())
      .post('/user')
      .send(user)
}

export const getUserFromCookie = (cookie: string[]) => {
    const encodedUser = cookie[0].split(';')[0].replace('express:sess=', '')
    const decodedUser = Buffer.from(encodedUser, 'base64').toString()
    return JSON.parse(decodedUser)
}

export const createPlanning = (app: INestApplication, planning: CreatePlanningDto) => {
    return request(app.getHttpServer())
      .post('/planning')
      .send(planning)
}

export const voteOnPlanning = (app: INestApplication, planningId: string, vote: VotePlanningDto) => {
    return request(app.getHttpServer())
      .patch(`/planning/${planningId}`)
      .send(vote)
}

export const getPlanning = (app: INestApplication, planningId: string) => {
    return request(app.getHttpServer())
      .get(`/planning/${planningId}`)
}

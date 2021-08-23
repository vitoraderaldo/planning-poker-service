import { Test, TestingModule } from '@nestjs/testing';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { PlanningService } from './planning.service';
import { PlanningRepository } from './repositories/planning.repository';
import { Types } from 'mongoose';
import { VoterDto } from './dto/voter.dto';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { PlanningDocument } from './schemas/planning.schema';

const Mock = jest.fn

describe('PlanningService', () => {
  let service: PlanningService;
  let planningRepository: Partial<PlanningRepository>

  let savedPlanning: Partial<PlanningDocument>
  const MAX_VOTERS: number = 20

  beforeEach(async () => {

    savedPlanning = {
      _id: '611923b4662b0500337df132',
      name: 'TXP-9281',
      createdBy: '4894949849449',
      revealed: false,
      voters: [],
    }

    planningRepository = {
      create: Mock((planningDto: CreatePlanningDto) => {
        return {
          _id: Types.ObjectId(),
          name: planningDto.name,
          createdBy: planningDto.userId,
          revealed: false,
          voters: []
        } as PlanningDocument
      }),
      get: Mock((id: string) => Promise.resolve(savedPlanning as PlanningDocument)),
      save: Mock((planning: PlanningDocument) => {
        planning['createdAt'] = new Date()
        planning['updatedAt'] = new Date()
        return Promise.resolve(planning)
      }),
      populate: Mock((planning: PlanningDocument) => Promise.resolve(planning))
    }

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningService,
        {
          provide: PlanningRepository,
          useValue: planningRepository
        }
      ],
    }).compile();

    service = module.get<PlanningService>(PlanningService);
  });

  it('Must be defined', () => {
    expect(service).toBeDefined();
  });

  it('Must get planning from repository', async () => {
    await service.get(savedPlanning._id)
    expect(planningRepository.get).toHaveBeenCalledWith(savedPlanning._id)
  })

  it('Must get planning from repository and populate', async () => {
    let planning = await service.get(savedPlanning._id, true)
    expect(planningRepository.get).toHaveBeenCalledWith(savedPlanning._id)
    expect(planningRepository.populate).toHaveBeenCalledWith(planning)
  })

  it('Must create a new planning at repository', async () => {
    const createPlanning = {
      name: 'Ticket Name',
      userId: '6119239a78df040027075af8'
    } as CreatePlanningDto

    await service.create(createPlanning, false)
    expect(planningRepository.create).toHaveBeenCalledWith(createPlanning)
    expect(planningRepository.save).toHaveBeenCalledTimes(1)
  })

  it('Must be able to vote for the first time', async () => {
    const voterDto1 = new VoterDto({
      planningId: savedPlanning._id,
      userId: 'userId',
      value: 3
    })
    const planning = await service.addVote(voterDto1)
    expect(planningRepository.get).toHaveBeenCalledWith(voterDto1.planningId)
    expect(planningRepository.save).toHaveBeenCalledWith(
      expect.objectContaining({
        voters: [
          {
            user: voterDto1.userId,
            value: voterDto1.value
          }
        ]
      })
    )
    expect(planning.voters.length).toBe(1)
  })

  it('Must be able to handle 20 different voters', async () => {
    let voter = new VoterDto({
      planningId: savedPlanning._id,
      userId: '',
      value: 3
    })
    for (let i: number = 0; i < MAX_VOTERS; i++) {
      voter.userId = `voter-${i}`
      await service.addVote(voter)
      expect(planningRepository.get).toHaveBeenCalledWith(voter.planningId)
    }
    expect(planningRepository.save).toHaveBeenCalledTimes(MAX_VOTERS)
    expect(savedPlanning.voters.length).toBe(MAX_VOTERS)
  })

  it('Must be able to change the vote', async () => {
    const voterDto = new VoterDto({
      planningId: savedPlanning._id,
      userId: 'userId',
      value: 3
    })
    await service.addVote(voterDto)
    voterDto.value = 5
    await service.addVote(voterDto)
    expect(savedPlanning.voters.length).toBe(1)
    expect(savedPlanning.voters[0]).toStrictEqual({
      user: 'userId',
      value: 5
    })
  })

  it('Must not allow more than 20 votes per planning', async () => {
    let voter = new VoterDto({
      planningId: savedPlanning._id,
      userId: '',
      value: 3
    })
    for (let i: number = 0; i < MAX_VOTERS; i++) {
      voter.userId = `voter-${i}`
      await service.addVote(voter)
    }
    voter.userId = 'newOne'
    try {
      await service.addVote(voter)
    } catch (err) {
      if (err instanceof BadRequestException) {
        expect(err.message).toBe('This planning has reached out the limit of voters')
        expect(savedPlanning.voters.length).toBe(20)
      } else {
        throw err
      }
    }
  })

  it('Must not vote when the planning is revealed', async () => {
    let voter = new VoterDto({
      planningId: savedPlanning._id,
      userId: '',
      value: 3
    })
    savedPlanning.revealed = true
    try {
      await service.addVote(voter)
    } catch (err) {
      if (err instanceof BadRequestException) {
        expect(err.message).toBe('Cannot vote on a planning that is already revealed')
      } else {
        throw err
      }
    }
  })

  it('Must be able to reveal the votes', async () => {
    const planning = await service.reveal(savedPlanning._id, savedPlanning.createdBy)
    expect(planning.revealed).toBe(true)
  })

  it('Non creators must not reveal the results', async () => {
    try {
      const planning = await service.reveal(savedPlanning._id, 'random_user_id')
    } catch (err) {
      if (err instanceof ForbiddenException) {
        expect(err.message).toBe('Only the creator can reveal the results')
      } else {
        throw err
      }
    }
  })

});

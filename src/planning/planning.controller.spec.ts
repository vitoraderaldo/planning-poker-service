import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { VoterDto } from './dto/voter.dto';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';
import { PlanningDocument } from './schemas/planning.schema';

describe('PlanningController', () => {
  let controller: PlanningController;
  let planningService: Partial<PlanningService>

  let savedPlanning = {
    name: 'TXP-9281',
    createdBy: '4894949849449',
    revelead: false,
    voters: []
  } as PlanningDocument

  beforeEach(async () => {

    planningService = {
      get: (id: string): any =>  Promise.resolve(savedPlanning),
      create: async (planningDto: CreatePlanningDto) => Promise.resolve({} as PlanningDocument),
      addVote: async (voterDto: VoterDto) => Promise.resolve({} as PlanningDocument)
    }

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlanningController],
      providers: [
        {
          provide: PlanningService,
          useValue: planningService
        }
      ]
    }).compile();

    controller = module.get<PlanningController>(PlanningController);
  });

  it('Must be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Must return planning by id', async () => {
    const plan = await controller.get('any id')
    expect(plan).toBe(savedPlanning)
  })

  it('Must throw exception when planning does not exist', async () => {
    planningService.get = async () => Promise.resolve(null)
    try {
      await controller.get('any id')
      throw new Error("Exception was not thrown")
    } catch (err) {
      expect(err).toBeInstanceOf(NotFoundException)
    }
  })

});

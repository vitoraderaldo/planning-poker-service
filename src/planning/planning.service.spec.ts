import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Model, NativeError } from 'mongoose';
import { PlanningService } from './planning.service';
import { Planning, PlanningDocument } from './schemas/planning.schema';

describe('PlanningService', () => {
  let service: PlanningService;
  let planningModel: Model<PlanningDocument>

  let savedPlanning = {
    name: 'TXP-9281',
    createdBy: '4894949849449',
    revelead: false,
    voters: [],
  } as PlanningDocument

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanningService,
        {
          provide: getModelToken(Planning.name),
          useValue: Model
        }
      ],
    }).compile();

    service = module.get<PlanningService>(PlanningService);
    planningModel = module.get<Model<PlanningDocument>>(getModelToken(Planning.name))
  });

  it('Must be defined', () => {
    expect(service).toBeDefined();
  });

  it('Must get planning from repository', () => {
    
   
  })
});

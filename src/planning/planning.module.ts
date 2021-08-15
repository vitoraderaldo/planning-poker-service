import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PlanningController } from './planning.controller';
import { PlanningService } from './planning.service';
import { PlanningRepository } from './repositories/planning.repository';
import { Planning, PlanningSchema } from './schemas/planning.schema';

@Module({
  imports: [MongooseModule.forFeature([{name: Planning.name, schema: PlanningSchema}])],
  controllers: [PlanningController],
  providers: [PlanningService, PlanningRepository]
})
export class PlanningModule {}

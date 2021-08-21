import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Serialize } from '../interceptors/serialize.interceptor';
import { MongoId } from '../pipes/mongo-id.pipe';
import { CurrentUser } from '../user/decotators/current-user.decorator';
import { UserGuard } from '../guards/user.guard';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { ViewPlanningDto } from './dto/view-planning.dto';
import { VotePlanningDto } from './dto/vote-planning.dto';
import { VoterDto } from './dto/voter.dto';
import { PlanningService } from './planning.service';

@Serialize(ViewPlanningDto)
@UseGuards(UserGuard)
@Controller('planning')
export class PlanningController {

    constructor(
        private planningService: PlanningService
    ) {}

    @Get(':id')
    async get(@Param('id', new MongoId()) id: string) {
        const planning = await this.planningService.get(id, true)
        if (!planning) {
            throw new NotFoundException('Planning not found')
        }
        return planning
    }

    @Patch(':id')
    async vote(@CurrentUser() currentUser: any, @Param('id', new MongoId()) id: string, @Body() body: VotePlanningDto) {
        const voterDto = new VoterDto({
            planningId: id,
            userId: currentUser._id,
            value: body.value
        })
        return await this.planningService.addVote(voterDto)
    }

    @Post()
    async create(@CurrentUser() currentUser: any, @Body() body: CreatePlanningDto) {
        body.userId = currentUser._id
        return await this.planningService.create(body, true)
    }
}

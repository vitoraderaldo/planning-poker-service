import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { Serialize } from 'src/interceptors/serialize.interceptor';
import { MongoId } from 'src/pipes/mongo-id.pipe';
import { CurrentUser } from 'src/user/decotators/current-user.decorator';
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
    get(@Param('id', new MongoId()) id: string) {
        const planning = this.planningService.getAndPópulate(id)
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
        return await this.planningService.addVoteAndPopulate(voterDto)
    }

    @Post()
    async create(@CurrentUser() currentUser: any, @Body() body: CreatePlanningDto) {      
        return await this.planningService.createAndPopulate(currentUser._id, body)
    }  
}
import { Body, Controller, Get, NotFoundException, Param, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { Serialize } from '../interceptors/serialize.interceptor';
import { MongoId } from '../pipes/mongo-id.pipe';
import { CurrentUser } from '../user/decotators/current-user.decorator';
import { UserGuard } from '../guards/user.guard';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { ViewPlanningDto } from './dto/view-planning.dto';
import { VotePlanningDto } from './dto/vote-planning.dto';
import { VoterDto } from './dto/voter.dto';
import { PlanningService } from './planning.service';
import { ApiTags, ApiOkResponse, ApiForbiddenResponse, ApiBadRequestResponse, ApiNotFoundResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { VoteInterceptor } from '../interceptors/vote.interceptor'

@UseInterceptors(new VoteInterceptor())
@Serialize(ViewPlanningDto)
@UseGuards(UserGuard)
@ApiTags('Planning')
@Controller('planning')
export class PlanningController {

    constructor(
        private planningService: PlanningService
    ) {}

    @Get(':id')
    @ApiOkResponse({description: 'The planning has been successfully retrieved.', type: ViewPlanningDto})
    @ApiForbiddenResponse({description: 'Only users can create a planning.'})
    @ApiNotFoundResponse({description: 'Planning was not found'})
    async get(@Param('id', new MongoId()) id: string) {
        const planning = await this.planningService.get(id, true)
        if (!planning) {
            throw new NotFoundException('Planning not found')
        }
        return planning
    }

    @Patch('vote/:id')
    @ApiOkResponse({description: 'The vote has been successfully computed.', type: ViewPlanningDto})
    @ApiForbiddenResponse({description: 'Only users can vote on a planning.'})
    @ApiNotFoundResponse({description: 'Planning was not found'})
    @ApiBadRequestResponse({description: 'Invalid payload'})
    @ApiBadRequestResponse({description: 'Cannot vote on a planning that is already revealed'})
    async vote(@CurrentUser() currentUser: any, @Param('id', new MongoId()) id: string, @Body() body: VotePlanningDto) {
        const voterDto = new VoterDto({
            planningId: id,
            userId: currentUser._id,
            value: body.value
        })
        return await this.planningService.addVote(voterDto)
    }

    @Patch('reveal/:id')
    @ApiOkResponse({description: 'The planning has been successfully revealed.', type: ViewPlanningDto})
    @ApiForbiddenResponse({description: 'Only the creator can reveal the results.'})
    @ApiNotFoundResponse({description: 'Planning was not found'})
    async reveal(@CurrentUser() currentUser: any, @Param('id', new MongoId()) id: string) {
       return await this.planningService.reveal(id, currentUser._id)
    }

    @Post()
    @ApiCreatedResponse({description: 'The planning has been successfully created.', type: ViewPlanningDto})
    @ApiForbiddenResponse({description: 'Only users can create a planning.'})
    @ApiBadRequestResponse({description: 'Invalid payload'})
    async create(@CurrentUser() currentUser: any, @Body() body: CreatePlanningDto) {
        body.userId = currentUser._id
        return await this.planningService.create(body, true)
    }
}

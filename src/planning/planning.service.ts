import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Planning, PlanningDocument } from './schemas/planning.schema';
import { Model } from 'mongoose';
import { VoterDto } from './dto/voter.dto';

@Injectable()
export class PlanningService {

    private MAX_VOTERS: number = 20

    constructor(
        @InjectModel(Planning.name) private planningModel: Model<PlanningDocument>,
    ) {}   

    private get(id: string) {
        return this.planningModel.findById(id)
    }

    getAndPopulate(id: string) {
        return this.get(id).populate('createdBy voters.user')
    }

    private create(userId: string, planningDto: CreatePlanningDto) {
        let planning = new this.planningModel({            
            name: planningDto.name,
            createdBy: userId,         
            relevead: false
        })               
        return planning.save()
    }

    async createAndPopulate(userId: string, planningDto: CreatePlanningDto) {
        let planning = this.create(userId, planningDto)
        return await planning.then(doc => doc.populate('createdBy').execPopulate())        
    }

    private async addVote(voterDto: VoterDto) {
        let planning = await this.get(voterDto.planningId)
        if (!planning) {
            throw new NotFoundException('Planning not found')
        }        
        const revote = this.revote(planning, voterDto)
        if (revote) {
            return revote
        }       
        return this.newVote(planning, voterDto)     
    }

    async addVoteAndPopulate(voterDto: VoterDto) {
        let planning = this.addVote(voterDto)
        return await planning.then(doc => doc.populate('createdBy voters.user').execPopulate())
    }

    private revote(planning: Planning, voterDto: VoterDto) {
        let userLastVote = planning.voters.find(voter => voter.user.toString() == voterDto.userId);
        if (userLastVote) {
            userLastVote.value = voterDto.value
            return planning.save()
        }
    }

    private newVote(planning: Planning, voterDto: VoterDto) {        
        if (planning.voters.length >= this.MAX_VOTERS) {
            throw new BadRequestException('This planning has reached out the limit of voters')
        }        
        planning.voters.push({
            user: voterDto.userId,
            value: voterDto.value
        } as any)

        return planning.save()  
    }    
}

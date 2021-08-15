import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { Planning } from './schemas/planning.schema';
import { VoterDto } from './dto/voter.dto';
import { PlanningRepository } from './repositories/planning.repository';

@Injectable()
export class PlanningService {

    private MAX_VOTERS: number = 20

    constructor(
        private planningRepository: PlanningRepository
    ) {}

    async get(id: string, populate: boolean = false) {
        let planning = await this.planningRepository.get(id)
        if (planning && populate) {
            return this.planningRepository.populate(planning)
        }
        return planning
    }

    async create(planningDto: CreatePlanningDto, populate: boolean = false) {
        let data = this.planningRepository.create(planningDto)
        let planning = await this.planningRepository.save(data)
        if (populate) {
            planning = this.planningRepository.populate(planning)
        }
        return planning
    }

    async addVote(voterDto: VoterDto) {
        let planning = await this.get(voterDto.planningId)
        if (!planning) {
            throw new NotFoundException('Planning not found')
        }
        const revote = this.revote(planning, voterDto)
        if (revote) {
            planning = await this.planningRepository.save(revote)
        } else {
            const newVote = this.newVote(planning, voterDto)
            planning = await this.planningRepository.save(newVote)
        }
        return this.planningRepository.populate(planning)
    }

    private revote(planning: Planning, voterDto: VoterDto) {
        let userLastVote = planning.voters.find(voter => voter.user.toString() == voterDto.userId);
        if (userLastVote) {
            userLastVote.value = voterDto.value
            return planning
        }
        return null
    }

    private newVote(planning: Planning, voterDto: VoterDto) {
        if (planning.voters.length >= this.MAX_VOTERS) {
            throw new BadRequestException('This planning has reached out the limit of voters')
        }
        planning.voters.push({
            user: voterDto.userId,
            value: voterDto.value
        } as any)

        return planning
    }
}

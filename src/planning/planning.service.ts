import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePlanningDto } from './dto/create-planning.dto';
import { PlanningDocument, Voter } from './schemas/planning.schema';
import { VoterDto } from './dto/voter.dto';
import { PlanningRepository } from './repositories/planning.repository';

@Injectable()
export class PlanningService {

    private MAX_VOTERS: number = 20

    constructor(
        private planningRepository: PlanningRepository
    ) {}

    async get(id: string, populate: boolean = false): Promise<PlanningDocument> {
        let planning = await this.planningRepository.get(id)
        if (planning && populate) {
            return await this.planningRepository.populate(planning)
        }
        return planning
    }

    async create(planningDto: CreatePlanningDto, populate: boolean = false) {
        let data = this.planningRepository.create(planningDto)
        let planning = await this.planningRepository.save(data)
        if (populate) {
            planning = await this.planningRepository.populate(planning)
        }
        return planning
    }

    async addVote(voterDto: VoterDto) {
        let planning = await this.get(voterDto.planningId)
        if (!planning) {
            throw new NotFoundException('Planning not found')
        }
        if (planning.revealed) {
            throw new BadRequestException('Cannot vote on a planning that is already revealed')
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

    async reveal(planningId: string, requestBy: string) {
        let planning = await this.get(planningId)
        if (!planning) {
            throw new NotFoundException('Planning not found')
        }
        if (planning.createdBy.toString() != requestBy.toString()) {
            throw new ForbiddenException('Only the creator can reveal the results')
        }
        if (!planning.revealed) {
            planning.revealed = true
            planning = await this.planningRepository.save(planning)
        }
        return await this.planningRepository.populate(planning)
    }

    private revote(planning: PlanningDocument, voterDto: VoterDto) {
        let userLastVote = planning.voters.find(voter => voter.user.toString() == voterDto.userId);
        if (userLastVote) {
            userLastVote.value = voterDto.value
            return planning
        }
        return null
    }

    private newVote(planning: PlanningDocument, voterDto: VoterDto) {
        if (planning.voters.length >= this.MAX_VOTERS) {
            throw new BadRequestException('This planning has reached out the limit of voters')
        }
        planning.voters.push({
            user: voterDto.userId,
            value: voterDto.value
        } as Voter)

        return planning
    }
}

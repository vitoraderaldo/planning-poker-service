import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreatePlanningDto } from "../dto/create-planning.dto";
import { Planning, PlanningDocument } from "../schemas/planning.schema";

@Injectable()
export class PlanningRepository {

    constructor(
        @InjectModel(Planning.name) private planningModel: Model<PlanningDocument>
    ) {}

    create(planningDto: CreatePlanningDto) {
        return new this.planningModel({
            name: planningDto.name,
            createdBy: planningDto.userId,
            relevead: false
        })
    }

    async get(id: string): Promise<PlanningDocument> {
        return this.planningModel.findById(id)
    }

    save(planning: any) {
        return planning.save()
    }

    populate(planning: any) {
        return planning.populate('createdBy voters.user').execPopulate()
    }
}

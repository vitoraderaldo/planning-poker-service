import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import * as mongoose from 'mongoose';
import { Document } from 'mongoose';

@Schema({timestamps: true})
export class Voter extends Document {   

    @Prop({required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    user: string

    @Prop({required: true, type: Number})
    value: Number   
}

const VoterSchema = SchemaFactory.createForClass(Voter)

@Schema({timestamps: true})
export class Planning extends Document {

    @Prop({required: true, type: String})
    name: string

    @Prop({required: true, type: mongoose.Schema.Types.ObjectId, ref: 'User'})
    createdBy: string

    @Prop({type: Boolean, default: false})
    revelead: boolean

    @Prop({type: [VoterSchema], default:[]})
    voters: Voter[]   
}

export const PlanningSchema = SchemaFactory.createForClass(Planning)
export type PlanningDocument = Planning & Document;

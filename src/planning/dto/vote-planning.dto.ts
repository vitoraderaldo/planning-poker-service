import { IsInt, IsPositive } from "class-validator";

export class VotePlanningDto {
    
    @IsPositive()
    @IsInt()
    value: number
}

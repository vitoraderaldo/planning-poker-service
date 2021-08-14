import { IsNotEmpty, IsString } from "class-validator";

export class CreatePlanningDto {

    @IsNotEmpty()
    @IsString()
    name: string
}

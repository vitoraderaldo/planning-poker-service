import { IsInt, IsPositive } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class VotePlanningDto {

    @ApiProperty()
    @IsPositive()
    @IsInt()
    value: number
}

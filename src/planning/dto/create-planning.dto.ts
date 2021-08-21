import { IsNotEmpty, IsString } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreatePlanningDto {

    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name: string

    userId: string
}

import { Matches } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {

    @ApiProperty()
    @Matches("^[A-Za-z ]+$")
    name: string
}
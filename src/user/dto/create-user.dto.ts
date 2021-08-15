import { Matches } from "class-validator";

export class CreateUserDto {
    @Matches("^[A-Za-z ]+$")
    name: string
}
import { Expose, Transform } from "class-transformer"

export class ViewUserDto {

    @Expose()
    @Transform(({obj}) => obj._id)
    id: string

    @Expose()
    name: string
}
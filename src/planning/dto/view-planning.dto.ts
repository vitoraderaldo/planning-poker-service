import { Expose, Transform, Type } from "class-transformer";
import { ApiProperty } from '@nestjs/swagger';

class User {

    @ApiProperty()
    @Expose()
    @Transform(({obj}) => obj._id)
    id: string

    @ApiProperty()
    @Expose()
    name: string
}

class Voter {
    @ApiProperty()
    @Expose()
    user: User

    @ApiProperty()
    @Expose()
    value: number

    @ApiProperty()
    @Expose()
    createdAt: Date

    @ApiProperty()
    @Expose()
    updatedAt: Date
}

export class ViewPlanningDto {

    @ApiProperty()
    @Expose()
    @Transform(({obj}) => obj._id)
    id: string

    @ApiProperty()
    @Expose()
    name: string

    @ApiProperty()
    @Expose()
    revealed: boolean

    @ApiProperty()
    @Expose()
    createdBy: User

    @ApiProperty()
    @Expose()
    createdAt: Date

    @ApiProperty()
    @Expose()
    updatedAt: Date

    @ApiProperty({type: [Voter]})
    @Expose()
    @Type(() => Voter)
    voters: Voter[]
}

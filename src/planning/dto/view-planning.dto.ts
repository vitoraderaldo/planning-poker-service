import { Expose, Transform } from "class-transformer";

class User {

    @Expose()
    @Transform(({obj}) => obj._id)
    id: string

    @Expose()
    name: string
}

class Voter {
    @Expose()    
    user: User

    @Expose()
    value: number    

    @Expose()
    createdAt: Date

    @Expose()
    updatedAt: Date    
}

export class ViewPlanningDto {

    @Expose()
    @Transform(({obj}) => obj._id)
    id: string

    @Expose()
    name: string

    @Expose()
    revelead: boolean

    @Expose()
    createdBy: User

    @Expose()
    createdAt: Date

    @Expose()
    updatedAt: Date
    
    @Expose()
    voters: Voter
}

import { Expose, Transform } from "class-transformer"
import { ApiProperty } from '@nestjs/swagger';

export class ViewUserDto {

    @ApiProperty()
    @Expose()
    @Transform(({obj}) => obj._id)
    id: string

    @ApiProperty()
    @Expose()
    name: string
}
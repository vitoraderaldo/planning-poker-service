import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { Model } from 'mongoose'

@Injectable()
export class UserService {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {}

    get(id: string) {        
        return this.userModel.findById(id)
    }

    create(userDto: CreateUserDto) {
        const user = new this.userModel({
            name: userDto.name
        })
        return user.save()        
    }
}

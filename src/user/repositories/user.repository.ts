import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { CreateUserDto } from "../dto/create-user.dto";
import { User, UserDocument } from "../schemas/user.schema";

@Injectable()
export class UserRepository {

    constructor(
        @InjectModel(User.name) private userModel: Model<UserDocument>
    ) {}

    create(userDto: CreateUserDto) {
        return new this.userModel({
            name: userDto.name
        })
    }

    get(id: string) {
        return this.userModel.findById(id)
    }

    save(user: UserDocument) {
        return user.save()
    }
}

import { Body, Controller, Post, Session, UseGuards } from '@nestjs/common';
import { Serialize } from '../interceptors/serialize.interceptor';
import { AnonymousGuard } from '../guards/anonymous.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { ViewUserDto } from './dto/view-user.dto';
import { UserService } from './user.service';
import { ApiTags, ApiCreatedResponse, ApiForbiddenResponse, ApiBadRequestResponse } from '@nestjs/swagger';

@ApiTags('User')
@Controller('user')
@UseGuards(AnonymousGuard)
@Serialize(ViewUserDto)
export class UserController {

    constructor(
        private userService: UserService
    ) {}

    @Post()
    @ApiCreatedResponse({description: 'The planning has been successfully created.', type: ViewUserDto,})
    @ApiForbiddenResponse({description: 'Only new users can create an account.'})
    @ApiBadRequestResponse({description: 'Invalid payload.'})
    async create(@Session() session: any, @Body() body: CreateUserDto) {
        const user = await this.userService.create(body)
        if (user?._id) {
            session.userId = user._id
        }
        return user
    }
}

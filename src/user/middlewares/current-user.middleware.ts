import { Injectable, NestMiddleware } from "@nestjs/common"
import { UserService } from "../user.service"
import { Request, Response, NextFunction } from "express";
import { UserDocument } from "src/user/schemas/user.schema";

declare global {
    namespace Express {
        interface Request {
            currentUser?: UserDocument
        }
    }
}

@Injectable()
export class CurrentUserMiddleware implements NestMiddleware {

    constructor(
        private userService: UserService
    ) {}

    async use(req: Request, res: Response, next: NextFunction) {
        const { userId } = req.session || {}
        if (userId) {            
            const user = await this.userService.get(userId)                
            req.currentUser = user
        }
        next()
    }
}

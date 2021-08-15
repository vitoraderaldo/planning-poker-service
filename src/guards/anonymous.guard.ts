import { CanActivate, ExecutionContext } from "@nestjs/common";

export class AnonymousGuard implements CanActivate {
    canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest()
        return !(request?.currentUser)
    }
}

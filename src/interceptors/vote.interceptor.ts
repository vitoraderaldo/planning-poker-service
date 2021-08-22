import { CallHandler, ExecutionContext, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";

export class VoteInterceptor implements NestInterceptor {

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        // Run something before a request is handled by the controller (incoming)
        const request = context.switchToHttp().getRequest()
        const userId = request.currentUser._id

        // Run something before the response is sent out (outgoing)
        return handler.handle().pipe(
            map((planning: any) => {
                if (!planning.revelead) {
                    for (let i = 0; i < planning.voters.length; i++) {
                        if (planning.voters[i].user._id.toString() != userId.toString()) {
                            planning.voters[i].value = null
                        }
                    }
                }
               return planning
            })
        )
    }
}

import { CallHandler, ExecutionContext, NestInterceptor, UseInterceptors } from "@nestjs/common";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { plainToClass } from "class-transformer";

export function Serialize(dto: any) {
    return UseInterceptors(new SerializeInterceptor(dto))
}

export class SerializeInterceptor implements NestInterceptor {

    constructor(
        private dto: any
    ) {}

    intercept(context: ExecutionContext, handler: CallHandler): Observable<any> {
        // Run something before a request is handled by the controller (incoming)
        
        // Run something before the response is sent out (outgoing)        
        return handler.handle().pipe(            
            map((data: any) => {
                return plainToClass(this.dto, data, {
                    excludeExtraneousValues: true,
                    enableImplicitConversion: true
                })
            })
        )
    }
}

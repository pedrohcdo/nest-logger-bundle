import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { HttpArgumentsHost } from '@nestjs/common/interfaces';
import { BundleAsyncLoggerContext } from '../../bundle/context/async-logger-context.service';
import { Response } from 'express';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class LoggerHttpInterceptor implements NestInterceptor {

    constructor(private loggerContext: BundleAsyncLoggerContext) {}

    private dispatchLogger(context: ExecutionContext, responseData: any) {
        const httpContext: HttpArgumentsHost = context.switchToHttp();


        if(httpContext && this.loggerContext.hasContext()) {

            const { loggerBundle } = this.loggerContext.getCurrent();

            // If it's exipired
            if(loggerBundle.isExpired())
                return;

            const request = httpContext.getRequest();
            const response: Response = httpContext.getResponse();

            if(request && response) {

                const { ip, method, path } = request;

                const message = `${method} ${path}`

                // Provide context
                loggerBundle.setContext({
                    method,
                    path,
                    ip,
                    response: {
                        headers: response.getHeaders(),
                        statusCode: response.statusCode,
                        data: responseData
                    }
                });
                
                // Dispatch
                this.loggerContext.dispatchCurrentLoggerBundle(message);
            }
        }
    }

    intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
        
        return next.handle().pipe(
            map(data => {

                this.dispatchLogger(context, data);
                return data;
            }),
        );
    }
}
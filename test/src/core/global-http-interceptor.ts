import { CallHandler, Catch, ExecutionContext } from '@nestjs/common';
import { LoggerHttpInterceptor } from '@pedrohcd/nest-logger';
import { Observable } from 'rxjs';

@Catch()
export class GlobalInterceptor extends LoggerHttpInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
		return super.intercept(context, next);
	}
}

import { CallHandler, Catch, ExecutionContext, Injectable } from '@nestjs/common';
import { LoggerHttpInterceptor } from '@pedrohcd/nest-logger';
import { Observable } from 'rxjs';

@Injectable()
export class GlobalInterceptor extends LoggerHttpInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
		return super.intercept(context, next);
	}
}

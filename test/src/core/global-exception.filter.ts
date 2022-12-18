import { ArgumentsHost, Catch } from '@nestjs/common';
import { LoggerExceptionFilter } from 'nest-logger-bundle';

@Catch()
export class GlobalExceptionFilter extends LoggerExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		super.catch(exception, host);
	}
}

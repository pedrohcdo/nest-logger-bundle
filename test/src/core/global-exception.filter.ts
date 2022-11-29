import { ArgumentsHost, Catch } from '@nestjs/common';
import { LoggerExceptionFilter } from '@pedrohcd/nest-logger';

@Catch()
export class GlobalExceptionFilter extends LoggerExceptionFilter {
	catch(exception: unknown, host: ArgumentsHost) {
		super.catch(exception, host);
	}
}

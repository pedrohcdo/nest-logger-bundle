import {
	ArgumentsHost,
	Catch,
	HttpException,
	HttpStatus,
} from '@nestjs/common'
import { BaseExceptionFilter } from '@nestjs/core'
import { MESSAGES } from '@nestjs/core/constants'
import { BundleAsyncLoggerContext } from '../../bundle/context/async-logger-context.service'
import { LoggerBundleService } from '../../logger/logger.service'

@Catch()
export class LoggerExceptionFilter extends BaseExceptionFilter {

	// httpAdapterHost is automatic injected
	constructor(private loggerService: LoggerBundleService, private loggerContext: BundleAsyncLoggerContext) {
		super()
		this.loggerService.setContextToken(LoggerExceptionFilter.name);
	}

	catch(exception: unknown, host: ArgumentsHost) {
		//
		const { httpAdapter } = this.httpAdapterHost

		const ctx = host.switchToHttp()

		const status =
			exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR

		const message =
			exception instanceof HttpException ? exception.message : MESSAGES.UNKNOWN_EXCEPTION_MESSAGE

		this.loggerService.error(exception, message)

		//
		if (this.loggerContext.hasContext())
			this.loggerContext.dispatchCurrentLoggerBundle(exception, message)
		
		//
		const responseBody = {
			statusCode: status,
			message: message,
			timestamp: new Date().toISOString(),
			path: httpAdapter.getRequestUrl(ctx.getRequest()),
		}
		
		httpAdapter.reply(ctx.getResponse(), responseBody, status)
	}
}

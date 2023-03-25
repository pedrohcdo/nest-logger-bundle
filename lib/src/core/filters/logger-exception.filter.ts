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
import { ErrorUtils } from '../error-utils'

@Catch()
export class LoggerExceptionFilter extends BaseExceptionFilter {

	// httpAdapterHost is automatic injected
	constructor(private loggerService: LoggerBundleService, private loggerContext: BundleAsyncLoggerContext) {
		super()
		this.loggerService.setContextToken(LoggerExceptionFilter.name);
	}

	catch(exception: any, host: ArgumentsHost) {
		//
		const { httpAdapter } = this.httpAdapterHost

		const ctx = host.switchToHttp()

		const error = ErrorUtils.exceptionToErrorObject(exception);
		this.loggerService.internalError(error, error.getCauseMessage())
		this.loggerContext.dispatchInternalError(error)
		
		//
		const responseBody = {
			statusCode: error.getStatus(),
			message: error.getMessage(),
			timestamp: new Date().toISOString(),
			path: httpAdapter.getRequestUrl(ctx.getRequest()),
		}
		
		httpAdapter.reply(ctx.getResponse(), responseBody, error.getStatus())
	}
}

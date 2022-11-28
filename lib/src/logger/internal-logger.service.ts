import { Inject, Injectable, ConsoleLogger } from '@nestjs/common'
import pino from 'pino'
import { PINO_LOGGER_PROVIDER_TOKEN } from '../nest-logger.params'

@Injectable()
export class InternalLoggerService extends ConsoleLogger {
	constructor(@Inject(PINO_LOGGER_PROVIDER_TOKEN) private streamLogger: pino.Logger) {
		super()
	}

	log(message: any, context?: string): void
	log(message: any, ...optionalParams: [...any, string?]): void
	log(message: any, ...optionalParams: any[]) {
		super.log(message, ...optionalParams)
		this.call('info', message, ...optionalParams)
	}

	error(message: any, context?: string): void
	error(message: any, ...optionalParams: [...any, string?]): void
	error(message: any, ...optionalParams: any[]) {
		super.error(message, ...optionalParams)
		this.call('error', message, ...optionalParams)
	}

	warn(message: any, context?: string): void
	warn(message: any, ...optionalParams: [...any, string?]): void
	warn(message: any, ...optionalParams: any[]) {
		super.warn(message, ...optionalParams)
		this.call('warn', message, ...optionalParams)
	}

	debug(message: any, context?: string): void
	debug(message: any, ...optionalParams: [...any, string?]): void
	debug(message: any, ...optionalParams: any[]) {
		super.debug(message, ...optionalParams)
		this.call('debug', message, ...optionalParams)
	}

	verbose(message: any, context?: string): void
	verbose(message: any, ...optionalParams: [...any, string?]): void
	verbose(message: any, ...optionalParams: any[]) {
		super.verbose(message, ...optionalParams)
		this.call('trace', message, ...optionalParams)
	}

	/** This funct was estracted from nestJs */
	contextAndStringToMessage(...args: any[]) {
		if ((args === null || args === void 0 ? void 0 : args.length) <= 1) {
			return { messages: args, context: this.context }
		}
		const lastElement = args[args.length - 1]
		const isContext = typeof lastElement === 'string'
		if (!isContext) return { messages: args, context: this.context }
		return {
			context: lastElement,
			messages: args.slice(0, args.length - 1),
		}
	}

	private call(level: pino.Level, message: any, context?: string): void
	private call(level: pino.Level, message: any, ...optionalParams: [...any, string?]): void
	private call(level: pino.Level, message: any, ...optionalParams: any[]) {
		const contextAndMessage = this.contextAndStringToMessage(message, ...optionalParams)
		const firstMessage =
			typeof contextAndMessage.messages === 'string'
				? contextAndMessage.messages
				: contextAndMessage.messages[0]
		this.streamLogger.child(contextAndMessage)[level](firstMessage)
	}
}

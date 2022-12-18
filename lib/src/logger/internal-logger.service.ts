import { Inject, Injectable, ConsoleLogger, LogLevel } from '@nestjs/common';
import pino from 'pino';
import { yellow } from '@nestjs/common/utils/cli-colors.util';
import {
	BUNDLE_LOGGER_PROVIDER_TOKEN,
	LINE_LOGGER_PROVIDER_TOKEN,
} from 'nest-logger-bundle/nest-logger.params';

@Injectable()
export class InternalLoggerService extends ConsoleLogger {
	constructor(
		@Inject(LINE_LOGGER_PROVIDER_TOKEN) private lineLogger: pino.Logger,
		@Inject(BUNDLE_LOGGER_PROVIDER_TOKEN) private bundleLogger: pino.Logger
	) {
		super();
	}

	log(message: any, context?: string): void;
	log(message: any, ...optionalParams: [...any, string?]): void;
	log(message: any, ...optionalParams: any[]) {
		//super.log(message, ...optionalParams);
		this.call('info', message, ...optionalParams);
	}

	error(message: any, context?: string): void;
	error(message: any, ...optionalParams: [...any, string?]): void;
	error(message: any, ...optionalParams: any[]) {
		//super.error(message, ...optionalParams);
		this.call('error', message, ...optionalParams);
	}

	warn(message: any, context?: string): void;
	warn(message: any, ...optionalParams: [...any, string?]): void;
	warn(message: any, ...optionalParams: any[]) {
		//super.warn(message, ...optionalParams);
		this.call('warn', message, ...optionalParams);
	}

	debug(message: any, context?: string): void;
	debug(message: any, ...optionalParams: [...any, string?]): void;
	debug(message: any, ...optionalParams: any[]) {
		//super.debug(message, ...optionalParams);
		this.call('debug', message, ...optionalParams);
	}

	verbose(message: any, context?: string): void;
	verbose(message: any, ...optionalParams: [...any, string?]): void;
	verbose(message: any, ...optionalParams: any[]) {
		//super.verbose(message, ...optionalParams);
		this.call('trace', message, ...optionalParams);
	}

	/** This funct was estracted from nestJs */
	contextAndStringToMessage(...args: any[]) {
		if ((args === null || args === void 0 ? void 0 : args.length) <= 1) {
			return { messages: args, context: this.context };
		}
		const lastElement = args[args.length - 1];
		const isContext = typeof lastElement === 'string';
		if (!isContext) return { messages: args, context: this.context };
		return {
			context: lastElement,
			messages: args.slice(0, args.length - 1),
		};
	}

	formatMessage(logLevel, contextMessage, message, timestampDiff) {
		const output = this.stringifyMessage(message, logLevel);
		return `${contextMessage}${output}${timestampDiff}`;
	}

	private call(level: pino.Level, message: any, context?: string): void;
	private call(level: pino.Level, message: any, ...optionalParams: [...any, string?]): void;
	private call(level: pino.Level, message: any, ...optionalParams: any) {
		const contextAndMessage = this.contextAndStringToMessage(message, ...optionalParams);
		const firstMessage =
			typeof contextAndMessage.messages === 'string'
				? contextAndMessage.messages
				: contextAndMessage.messages[0];

		const timestampDiff = (this as any).updateAndGetTimestampDiff();
		const contextMessage = yellow(`[${contextAndMessage.context}] `);
		const formattedMessage = this.formatMessage(level as LogLevel, contextMessage, message, timestampDiff);
		//process[writeStreamType !== null && writeStreamType !== void 0 ? writeStreamType : 'stdout'].write(formattedMessage);

		// It is worth remembering that it will never send to repeated channels,
		// for example, each logger will always have its unique destination, and some of them may be 'enabled = false'
		// Possible combinations:
		//    bundleLogger -> streams, pretty /  lineLogger -> disabled
		//    lineLogger -> streams, pretty /  bundleLogger -> disabled
		//    bundleLogger -> stream /  lineLogger -> pretty
		//    bundleLogger -> pretty /  lineLogger -> stream
		this.lineLogger.child({})[level](formattedMessage);
		this.bundleLogger.child({})[level](formattedMessage);
	}
}

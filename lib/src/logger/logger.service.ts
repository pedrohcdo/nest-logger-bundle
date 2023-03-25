import { Inject, Injectable, Scope, LoggerService } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import { LINE_LOGGER_PROVIDER_TOKEN } from 'nest-logger-bundle/nest-logger.params';
import pino from 'pino';
import { BundleAsyncLoggerContext } from '../bundle/context/async-logger-context.service';
import { LoggerFunction, PinoMethods } from '../bundle/context/logger.definitions';
import { LoggerBundle } from '../bundle/logger-bundle.service';

@Injectable({
	scope: Scope.TRANSIENT,
})
export class LoggerBundleService implements PinoMethods, LoggerService {
	private contextToken: string;
	private dettachedFromBundle: boolean = false;

	constructor(
		protected loggerContext: BundleAsyncLoggerContext,
		private moduleRef: ModuleRef,
		@Inject(LINE_LOGGER_PROVIDER_TOKEN) private lineLogger: pino.Logger
	) {
		this.contextToken = null;
	}

	setContextToken(contextToken: string) {
		this.contextToken = contextToken;
	}

	dettachFromBundle() {
		this.dettachedFromBundle = true;
	}

	putTag(tag: string, value: string) {
		this.bundle?.putTag(tag, value);
	}

	enter(branchName: string) {
		this.bundle?.enter(branchName);
	}

	trace(msg: string, ...args: any[]): void;
	trace(obj: unknown, msg?: string, ...args: any[]): void;
	trace(...args: Parameters<LoggerFunction>) {
		this.call('trace', ...args);
	}

	debug(msg: string, ...args: any[]): void;
	debug(obj: unknown, msg?: string, ...args: any[]): void;
	debug(...args: Parameters<LoggerFunction>) {
		this.call('debug', ...args);
	}

	info(msg: string, ...args: any[]): void;
	info(obj: unknown, msg?: string, ...args: any[]): void;
	info(...args: Parameters<LoggerFunction>) {
		this.call('info', ...args);
	}

	warn(msg: string, ...args: any[]): void;
	warn(obj: unknown, msg?: string, ...args: any[]): void;
	warn(...args: Parameters<LoggerFunction>) {
		this.call('warn', ...args);
	}

	error(msg: string, ...args: any[]): void;
	error(obj: unknown, msg?: string, ...args: any[]): void;
	error(...args: Parameters<LoggerFunction>) {
		this.call('error', ...args);
	}

	internalError(error: any, msg: string, ...args: any[]) {
		this.call(
			'error',
			error,
			msg,
			...args
		)
	}

	fatal(msg: string, ...args: any[]): void;
	fatal(obj: unknown, msg?: string, ...args: any[]): void;
	fatal(...args: Parameters<LoggerFunction>) {
		this.call('fatal', ...args);
	}

	// For Nest LoggerService contract
	verbose(message: any, ...optionalParams: any[]) {
		this.call('trace', message, ...optionalParams);
	}
	log(message: any, ...optionalParams: any[]) {
		this.call('info', message, ...optionalParams);
	}

	//
	private call(level: pino.Level, ...args: Parameters<LoggerFunction>) {
		if (this.contextToken) {
			if (typeof args[0] === 'object') {
				const firstArg = args[0];
				if (firstArg instanceof Error) {
					args = [
						{
							context: this.contextToken,
							err: firstArg,
						},
						...args.slice(1),
					];
				} else {
					args = [Object.assign({ context: this.contextToken }, firstArg), ...args.slice(1)];
				}
			} else {
				args = [{ context: this.contextToken }, ...args] as any;
			}
		}
		this.bundle?.log(level, args[0], ...args.slice(1));
		this.lineLogger[level](args[0], ...args.slice(1));
	}

	exit() {
		this.bundle?.exit();
	}

	async createAsyncLogger(): Promise<AsyncLoggerService> {
		const detachedLoggerService: AsyncLoggerService = await this.moduleRef.create(AsyncLoggerService);
		detachedLoggerService.loggerContext = await this.loggerContext.createDetachedContext();
		return detachedLoggerService;
	}

	private get bundle(): LoggerBundle | null {
		if (!this.dettachedFromBundle && this.loggerContext.hasContext())
			return this.loggerContext.getCurrent().loggerBundle;
		return null;
	}
}

@Injectable({
	scope: Scope.TRANSIENT,
})
export class AsyncLoggerService extends LoggerBundleService {
	dispatch(message: string) {
		this.loggerContext.dispatchCurrentLoggerBundle(message);
	}
}

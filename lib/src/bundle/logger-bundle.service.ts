import { Inject, Injectable, Scope } from '@nestjs/common';
import { NestLoggerLevelStrategy, NestLoggerParams } from '../nest-logger.params';
import pino from 'pino';
import { MODULE_OPTIONS_TOKEN } from '../nest-logger.module-definition';
import { LoggerFunction } from './context/logger.definitions';
import { LoggerBranch } from './logger-branch/logger-branch';

export interface LoggerBindingsContext {
	method?: string;
	path?: string;
	duration?: number;
	ip?: string;
	response?: {
		statusCode: number;
		headers: any;
		data?: any;
	};
}

export interface LoggerBindings {
	context: LoggerBindingsContext;

	tags: {
		[key: string]: string;
	};
}

export class LoggableBundleObject {
	object: any;
	level: string;
}

/**
 * A bundle will be created for each request received
 */
@Injectable({
	scope: Scope.REQUEST,
})
export class NestLoggerBundle {
	private expired: boolean = false;
	private currentBranch: LoggerBranch;
	private bindings: LoggerBindings;

	constructor(@Inject(MODULE_OPTIONS_TOKEN) private params: NestLoggerParams) {
		this.currentBranch = new LoggerBranch(null, 'root');
		this.bindings = {
			context: {},
			tags: {},
		};
	}

	setContext(context: LoggerBindingsContext) {
		Object.assign(this.bindings.context, context);
	}

	putTag(tag: string, value: string) {
		this.bindings.tags[tag] = value;
	}

	copyFrom(otherBundle: NestLoggerBundle) {
		this.currentBranch = otherBundle.getRootBranch().clone() as LoggerBranch;
		this.bindings = {
			context: Object.assign({}, otherBundle.bindings.context),
			tags: Object.assign({}, otherBundle.bindings.tags),
		};
	}

	enter(branchName: string) {
		this.currentBranch = this.currentBranch.enter(branchName);
	}

	log(level: pino.Level, msg: string, ...args: any[]): void;
	log(level: pino.Level, obj: unknown, msg?: string, ...args: any[]): void;
	log(level: pino.Level, ...params: Parameters<LoggerFunction>) {
		this.currentBranch.log(level, ...params);
	}

	exit() {
		if (!this.currentBranch.parent) throw Error('Could not close current branch.');
		this.currentBranch = this.currentBranch.exit();
	}

	private getRootBranch() {
		let current = this.currentBranch;
		while (current.parent) {
			current = current.parent;
		}
		return current;
	}

	build(): LoggableBundleObject {
		//
		while (this.currentBranch.parent) {
			this.currentBranch = this.currentBranch.exit();
		}
		this.currentBranch.exit();

		///
		const bindings = {
			context: Object.assign(
				{
					requestDuration: this.currentBranch.profiling(),
				},
				this.bindings.context
			),

			tags: Object.assign({}, this.bindings.tags),
		};
		delete bindings.context.response;

		if (this.bindings.context.response) {
			Object.assign(bindings, {
				res: this.bindings.context.response,
			});
		}

		//
		const object = {
			logs: this.currentBranch.toObject(),
			...bindings,
		};
		const level = this.currentBranch.introspectLevel(
			this.params?.contextBundle?.strategy?.level || NestLoggerLevelStrategy.MAJOR_LEVEL,
			this.params?.contextBundle?.defaultLevel || 'info'
		);

		//
		return {
			object,
			level,
		};
	}

	expireNow() {
		this.expired = true;
	}

	isExpired() {
		return this.expired;
	}
}

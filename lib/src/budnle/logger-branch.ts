import pino from 'pino';
import { NestLoggerLevelStrategy } from '../nest-logger.params';
import { NestLoggerUtils } from './context.utils';
import { LoggerFunction } from './logger.definitions';

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
	tgContext: LoggerBindingsContext;

	tgTags: {
		[key: string]: string;
	};
}

export interface LoggerNode {
	toObject(): any;
	introspectLevel(_: NestLoggerLevelStrategy, defaultLevel: string): string;
	clone(parent?: LoggerBranch): LoggerNode;
}

export class LoggerLeaf implements LoggerNode {
	constructor(public level: pino.Level, public log: Parameters<LoggerFunction>) {}

	toObject() {
		return {
			level: this.level,
			...NestLoggerUtils.parseLoggedParamsToObject(this.log),
		};
	}

	introspectLevel(_: NestLoggerLevelStrategy, defaultLevel: string = 'info') {
		if (!this.level) return defaultLevel;
		return this.level;
	}

	clone(parent: LoggerBranch): LoggerNode {
		// Cloning, this is a simple object with {message, {...loggableData}}
		const clonedLoggedObject = JSON.parse(JSON.stringify(this.log));
		return new LoggerLeaf(this.level, clonedLoggedObject);
	}
}

export class LoggerBranch implements LoggerNode {
	createdAt: number = Date.now();
	exitedAt: number;

	branchs: LoggerNode[] = [];

	constructor(private _parent: LoggerBranch, public branchName: string) {}

	get parent(): LoggerBranch {
		return this._parent;
	}

	enter(branchName: string): LoggerBranch {
		const newBranch = new LoggerBranch(this, branchName);
		this.branchs.push(newBranch);
		return newBranch;
	}

	log(level: pino.Level, ...params: Parameters<LoggerFunction>) {
		this.branchs.push(new LoggerLeaf(level, params));
	}

	exit(): LoggerBranch {
		this.exitedAt = Date.now();
		if (this._parent) return this.parent;
		return null;
	}

	profiling(): number {
		if (this.exitedAt === null || this.exitedAt === undefined) return undefined;
		return this.exitedAt - this.createdAt;
	}

	introspectLevel(strategy: NestLoggerLevelStrategy, defaultLevel = 'info'): string {
		let currentLevel: string = null;
		for (const branch of this.branchs) {
			const cLevel = branch.introspectLevel(strategy, defaultLevel);
			if (currentLevel === null) {
				currentLevel = cLevel;
			} else {
				const lv1 = pino.levels.values[currentLevel];
				const lv2 = pino.levels.values[cLevel];
				switch (strategy as NestLoggerLevelStrategy) {
					default:
					case NestLoggerLevelStrategy.LAST_LEVEL:
						currentLevel = cLevel;
						break;
					case NestLoggerLevelStrategy.MINOR_LEVEL: {
						currentLevel = pino.levels.labels[Math.min(lv1, lv2)];
						break;
					}
					case NestLoggerLevelStrategy.LAST_LEVEL:
						currentLevel = pino.levels.labels[Math.max(lv1, lv2)];
						break;
				}
			}
		}
		if (currentLevel === null) currentLevel = defaultLevel;
		return currentLevel;
	}

	toObject() {
		const object = {
			profiling: this.exitedAt - this.createdAt + 'ms',
			name: this.branchName,
			logs: [],
		};
		for (let branch of this.branchs) {
			object.logs.push(branch.toObject());
		}

		return object;
	}

	clone(parent: LoggerBranch = null): LoggerNode {
		const cloned = new LoggerBranch(parent, this.branchName);
		cloned.createdAt = this.createdAt;
		cloned.exitedAt = this.exitedAt;
		for (let branch of this.branchs) {
			cloned.branchs.push(branch.clone(cloned));
		}
		return cloned;
	}
}

import pino from "pino";
import { LoggerFunction, PinoLevels } from "../context/logger.definitions";
import { LoggerLeaf } from "./logger-leaf";
import { LoggerNode } from "./logger-node";
import { NestLoggerLevelStrategy } from '../../nest-logger.params';

export class LoggerBranch implements LoggerNode {
	createdAt: number = Date.now();
	exitedAt?: number = null;

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

	introspectLevel(strategy: NestLoggerLevelStrategy = NestLoggerLevelStrategy.MAJOR_LEVEL, defaultLevel: PinoLevels = 'info'): PinoLevels {
		let currentLevel: PinoLevels = null;
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
						currentLevel = pino.levels.labels[Math.min(lv1, lv2)] as PinoLevels;
						break;
					}
					case NestLoggerLevelStrategy.MAJOR_LEVEL:
						currentLevel = pino.levels.labels[Math.max(lv1, lv2)] as PinoLevels;
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

	clone(parent: LoggerBranch = null): LoggerBranch {
		const cloned = new LoggerBranch(parent, this.branchName);
		cloned.createdAt = this.createdAt;
		cloned.exitedAt = this.exitedAt;
		for (let branch of this.branchs) {
			cloned.branchs.push(branch.clone(cloned));
		}
		return cloned;
	}
}
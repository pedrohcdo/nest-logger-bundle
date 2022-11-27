import { NestLoggerLevelStrategy } from "@pedrohcd/nest-logger/nest-logger.params";
import pino from "pino";
import { NestLoggerUtils } from "../context.utils";
import { LoggerFunction, PinoLevels } from "../logger.definitions";
import { LoggerBranch } from "./logger-branch";
import { LoggerNode } from "./logger-node";

export class LoggerLeaf implements LoggerNode {
	constructor(public level: pino.Level, public log: Parameters<LoggerFunction>) {}

	toObject() {
		return {
			level: this.level,
			...NestLoggerUtils.parseLoggedParamsToObject(this.log),
		};
	}

	introspectLevel(_: NestLoggerLevelStrategy, defaultLevel: PinoLevels = 'info'): PinoLevels {
		if (!this.level) return defaultLevel;
		return this.level;
	}

	clone(): LoggerNode {
		// Cloning, this is a simple object with {message, {...loggableData}}
		const clonedLoggedObject = JSON.parse(JSON.stringify(this.log));
		return new LoggerLeaf(this.level, clonedLoggedObject);
	}
}

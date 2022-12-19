import { LoggerBundleLevelStrategy } from "../../nest-logger.params";
import pino from "pino";
import { LoggerFunction, PinoLevels } from "../context/logger.definitions";
import { LoggerBranchUtils } from "./branch.utils";
import { LoggerNode } from "./logger-node";

export class LoggerLeaf implements LoggerNode {
	constructor(public level: pino.Level, public log: Parameters<LoggerFunction>) {}

	toObject() {
		return {
			level: this.level,
			...LoggerBranchUtils.parseLoggedParamsToObject(this.log),
		};
	}

	introspectLevel(_: LoggerBundleLevelStrategy, defaultLevel: PinoLevels = 'info'): PinoLevels {
		if (!this.level) return defaultLevel;
		return this.level;
	}

	clone(): LoggerNode {
		// Cloning, this is a simple object with {message, {...loggableData}}
		const clonedLoggedObject = JSON.parse(JSON.stringify(this.log));
		return new LoggerLeaf(this.level, clonedLoggedObject);
	}
}

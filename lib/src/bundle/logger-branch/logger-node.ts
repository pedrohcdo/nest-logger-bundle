import { LoggerBundleLevelStrategy } from "../../nest-logger.params";
import { PinoLevels } from "../context/logger.definitions";

export interface LoggerNode {

	toObject(): any;
	introspectLevel(_: LoggerBundleLevelStrategy, defaultLevel: string): PinoLevels;
	clone(parent?: LoggerNode): LoggerNode;
}

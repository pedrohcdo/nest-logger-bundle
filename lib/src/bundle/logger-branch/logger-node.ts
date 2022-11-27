import { NestLoggerLevelStrategy } from "@pedrohcd/nest-logger/nest-logger.params";

export interface LoggerNode {
    
	toObject(): any;
	introspectLevel(_: NestLoggerLevelStrategy, defaultLevel: string): string;
	clone(parent?: LoggerNode): LoggerNode;
}

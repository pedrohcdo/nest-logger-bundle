import { ContextId } from '@nestjs/core';
import { AsyncLocalStorage } from 'async_hooks';
import { Logger } from 'pino';

export class NestLoggerStore {
	constructor(public loggerContext: any, public reqId: any, public logger: Logger) {}
}

export const NestLoggerStorage = new AsyncLocalStorage<NestLoggerStore>();

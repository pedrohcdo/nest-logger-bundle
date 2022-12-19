import { AsyncLocalStorage } from 'async_hooks';
import { Logger } from 'pino';

export class BundleLoggerStore {
	constructor(public loggerContext: any, public reqId: any, public logger: Logger) {}
}

export const BundleLoggerStorage = new AsyncLocalStorage<BundleLoggerStore>();

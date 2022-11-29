import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import pino from 'pino';
import { MODULE_OPTIONS_TOKEN } from '../../nest-logger.module-definition';
import {
	NestLoggerDispatchStrategy,
	NestLoggerParams,
	PINO_LOGGER_PROVIDER_TOKEN,
} from '../../nest-logger.params';
import { NestLoggerBundle } from '../logger-bundle.service';
import { NestLoggerStorage } from './async-logger.hook';

/**
 *  This asynchronous context handles bundles using 'NestLoggerStorage' which in turn uses 'AsyncLocalStorage'.
 */
@Injectable({})
export class NestAsyncLoggerContext {

	private detachedContext: {
		logger: pino.Logger;
		reqId: string;
		loggerBundle: NestLoggerBundle;
	};

	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) private params: NestLoggerParams,
		@Inject(PINO_LOGGER_PROVIDER_TOKEN) private streamLogger: pino.Logger,
		private moduleRef: ModuleRef
	) {}

	getCurrent() {
		if (this.detachedContext) return this.detachedContext;

		if (!this.hasContext()) {
			return null;
		}

		const fromStore = NestLoggerStorage.getStore();

		return {
			logger: fromStore.logger,
			reqId: fromStore.reqId,
			loggerBundle: fromStore.loggerContext,
		};
	}

	// 
	dispatchCurrentLoggerBundle(message: string): void;
	dispatchCurrentLoggerBundle(innerObject: unknown, message?: string): void;
	dispatchCurrentLoggerBundle(innerObject: unknown, message?: string) {
		if (!this.hasContext()) {
			return;
		}

		const { logger, loggerBundle } = this.getCurrent();

		//
		if (this.params.contextBundle.strategy.onDispatch === NestLoggerDispatchStrategy.DISPATCH) {
			const { object, level } = loggerBundle.build();

			//
			const childLogger = logger.child(object);
			if (message) childLogger[level](innerObject, message);
			else childLogger[level](innerObject);
			childLogger.flush(); // force even with sync
		}

		loggerBundle.expireNow();
	}

	hasContext() {
		return !!NestLoggerStorage.getStore();
	}

	/**
	 * Creates a new detached context which in turn no longer uses 'NestLoggerStorage', 
	 * this detached context is created with a fixed bundle because it loses the ability to work asynchronously.
	 */
	async createDetachedContext(): Promise<NestAsyncLoggerContext> {
		const context = await this.moduleRef.create(NestAsyncLoggerContext);
		const detachedLoggerBundle = await this.moduleRef.create(NestLoggerBundle);

		let getFrom: {
			logger: pino.Logger;
			reqId: string;
			loggerBundle: NestLoggerBundle;
		};

		if (this.detachedContext) {
			getFrom = this.detachedContext;
		} else if (this.hasContext()) {
			getFrom = this.getCurrent();
		} else {
			getFrom = {
				logger: this.streamLogger,
				loggerBundle: null,
				reqId: '<unknown>',
			};
		}

		const { logger, loggerBundle, reqId } = getFrom;

		if (loggerBundle) detachedLoggerBundle.copyFrom(loggerBundle);

		context.detachedContext = {
			logger,
			loggerBundle: detachedLoggerBundle,
			reqId,
		};

		return context;
	}
}
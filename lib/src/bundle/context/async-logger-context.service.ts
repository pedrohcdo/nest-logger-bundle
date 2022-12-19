import { Inject, Injectable } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
import pino from 'pino';
import { MODULE_OPTIONS_TOKEN } from '../../nest-logger.module-definition';
import {
	BUNDLE_LOGGER_PROVIDER_TOKEN,
	LoggerBundleParams
} from '../../nest-logger.params';
import { NestLoggerBundle } from '../logger-bundle.service';
import { BundleLoggerStorage } from './async-logger.hook';

/**
 *  This asynchronous context handles bundles using 'NestLoggerStorage' which in turn uses 'AsyncLocalStorage'.
 */
@Injectable({})
export class BundleAsyncLoggerContext {

	private detachedContext: {
		logger: pino.Logger;
		reqId: string;
		loggerBundle: NestLoggerBundle;
	};

	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) private params: LoggerBundleParams,
		@Inject(BUNDLE_LOGGER_PROVIDER_TOKEN) private bundleLogger: pino.Logger,
		private moduleRef: ModuleRef
	) {}

	getCurrent() {
		if (this.detachedContext) return this.detachedContext;

		if (!this.hasContext()) {
			return null;
		}

		const fromStore = BundleLoggerStorage.getStore();

		return {
			logger: fromStore.logger,
			reqId: fromStore.reqId,
			loggerBundle: fromStore.loggerContext,
		};
	}

	// 
	dispatchCurrentLoggerBundle(message: string): void;
	dispatchCurrentLoggerBundle(exception: unknown, message?: string): void;
	dispatchCurrentLoggerBundle(exceptionOrMessage: unknown, message?: string) {
		if (!this.hasContext()) {
			return;
		}

		const { logger, loggerBundle } = this.getCurrent();


		const { object, level } = loggerBundle.build();

		//
		const childLogger = logger.child(object);
		if (message) childLogger[level](exceptionOrMessage, message);
		else childLogger[level](exceptionOrMessage);
		childLogger.flush(); // force even with sync

		//
		loggerBundle.expireNow();
	}

	hasContext() {
		return !!BundleLoggerStorage.getStore();
	}

	/**
	 * Creates a new detached context which in turn no longer uses 'NestLoggerStorage', 
	 * this detached context is created with a fixed bundle because it loses the ability to work asynchronously.
	 */
	async createDetachedContext(): Promise<BundleAsyncLoggerContext> {
		const context = await this.moduleRef.create(BundleAsyncLoggerContext);
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
				logger: this.bundleLogger,
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

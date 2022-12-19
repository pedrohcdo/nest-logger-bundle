import {
	Inject,
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { BundleAsyncLoggerContext, LoggerBundle } from './bundle'
import { LoggerBundleHookMiddleware } from './core'
import { BundleLoggerProvider } from './core/providers/bundle-logger.provider'
import { LineLoggerProvider } from './core/providers/pretty-logger.provider'
import { InternalLoggerService, LoggerBundleService } from './logger'
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './nest-logger.module-definition'
import { BUNDLE_LOGGER_PROVIDER_TOKEN, LoggerBundleParams } from './nest-logger.params'

@Module({
	providers: [
		LoggerBundle,
		LoggerBundleService,
		BundleAsyncLoggerContext,
		InternalLoggerService,
		BundleLoggerProvider,
		LineLoggerProvider
	],
	exports: [
		LoggerBundle,
		LoggerBundleService,
		BundleAsyncLoggerContext,
		InternalLoggerService,
		LineLoggerProvider,
		LineLoggerProvider
	],
})
export class LoggerBundleModule extends ConfigurableModuleClass implements NestModule {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) private params: LoggerBundleParams,
		@Inject(BUNDLE_LOGGER_PROVIDER_TOKEN) private bundleLogger: pino.Logger,
	) {
		super()
	}

	async configure(consumer: MiddlewareConsumer) {
		const middleware = pinoHttp({
			//...this.params.pinoHttp,
			autoLogging: false,
			customAttributeKeys: {
				res: 'pinoRes',
			},
			logger: this.bundleLogger,
		})
		
		const routes = this.params.forRoutes || [{ path: '*', method: RequestMethod.ALL }];

		consumer.apply(middleware, LoggerBundleHookMiddleware).forRoutes(...routes)
	}
}

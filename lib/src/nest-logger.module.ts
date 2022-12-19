import {
	Inject,
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { NestAsyncLoggerContext, NestLoggerBundle } from './bundle'
import { NestLoggerHookMiddleware } from './core'
import { BundleLoggerProvider } from './core/providers/bundle-logger.provider'
import { LineLoggerProvider } from './core/providers/pretty-logger.provider'
import { InternalLoggerService, NestLoggerService } from './logger'
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './nest-logger.module-definition'
import { BUNDLE_LOGGER_PROVIDER_TOKEN, NestLoggerParams } from './nest-logger.params'

@Module({
	providers: [
		NestLoggerBundle,
		NestLoggerService,
		NestAsyncLoggerContext,
		InternalLoggerService,
		BundleLoggerProvider,
		LineLoggerProvider
	],
	exports: [
		NestLoggerBundle,
		NestLoggerService,
		NestAsyncLoggerContext,
		InternalLoggerService,
		LineLoggerProvider,
		LineLoggerProvider
	],
})
export class NestLoggerModule extends ConfigurableModuleClass implements NestModule {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) private params: NestLoggerParams,
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

		consumer.apply(middleware, NestLoggerHookMiddleware).forRoutes(...routes)
	}
}

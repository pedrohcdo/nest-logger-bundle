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
import { NestLoggerHookMiddleware, PinoLoggerProvider, RootLoggerProvider } from './core'
import { InternalLoggerService, NestLoggerService } from './logger'
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './nest-logger.module-definition'
import { NestLoggerParams, PINO_LOGGER_PROVIDER_TOKEN } from './nest-logger.params'

@Module({
	providers: [
		NestLoggerBundle,
		NestLoggerService,
		NestAsyncLoggerContext,
		InternalLoggerService,
		RootLoggerProvider,
		PinoLoggerProvider
	],
	exports: [
		NestLoggerBundle,
		NestLoggerService,
		NestAsyncLoggerContext,
		InternalLoggerService,
		RootLoggerProvider,
		PinoLoggerProvider
	],
})
export class NestLoggerModule extends ConfigurableModuleClass implements NestModule {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) private params: NestLoggerParams,
		@Inject(PINO_LOGGER_PROVIDER_TOKEN) private pinoLogger: pino.Logger
	) {
		super()
	}

	async configure(consumer: MiddlewareConsumer) {
		const middleware = pinoHttp({
			...this.params.pinoHttp,
			autoLogging: false,
			customAttributeKeys: {
				res: 'pinoRes',
			},
			logger: this.pinoLogger,
		})

		consumer.apply(middleware, NestLoggerHookMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}

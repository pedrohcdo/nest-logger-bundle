import {
	Inject,
	MiddlewareConsumer,
	Module,
	NestModule,
	RequestMethod,
} from '@nestjs/common'
import pino from 'pino'
import pinoHttp from 'pino-http'
import { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } from './nest-logger.module-definition'
import { BindLoggerMiddleware } from './middleware/bind-logger.middleware'
import { NestLoggerParams, PINO_HTTP_PROVIDER_TOKEN } from './nest-logger.params'

@Module({
	providers: [

	],
	exports: [

	],
})
export class NestLoggerModule extends ConfigurableModuleClass implements NestModule {
	constructor(
		@Inject(MODULE_OPTIONS_TOKEN) private params: NestLoggerParams,
		@Inject(PINO_HTTP_PROVIDER_TOKEN) private streamLogger: pino.Logger
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
			logger: this.streamLogger,
		})

		consumer.apply(middleware, BindLoggerMiddleware).forRoutes({ path: '*', method: RequestMethod.ALL })
	}
}

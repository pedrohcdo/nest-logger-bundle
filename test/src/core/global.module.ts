import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import environment from '../config/environment.config';
import { GlobalInterceptor } from './global-http-interceptor';
import { GlobalExceptionFilter } from './global-exception.filter';

import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { environmentSchema } from '../config/environment.schema';
import {
	NestLoggerDispatchStrategy,
	NestLoggerLevelStrategy,
	NestLoggerModule,
	NestLoggerOnErrorStrategy,
	NestLoggerParams,
} from '@pedrohcd/nest-logger';

//
const { NODE_ENV } = process.env;
const prod = !NODE_ENV || NODE_ENV === 'production';

@Global()
@Module({
	imports: [
		ConfigModule.forRoot({
			envFilePath: !prod ? `./environment/${process.env.NODE_ENV}.env` : '',
			isGlobal: false,
			load: [environment],
			validationSchema: environmentSchema,
		}),

		//
		NestLoggerModule.forRootAsync({
			isGlobal: false,
			useFactory: (config: ConfigService): NestLoggerParams => {
				return {
					/** don't change this */
					pinoHttp: {
						level: !prod ? 'trace' : 'info',
					},

					// You can change this
					contextBundle: {
						strategy: {
							onDispatch: NestLoggerDispatchStrategy.DISPATCH,
							level: NestLoggerLevelStrategy.MAJOR_LEVEL,
							onError: NestLoggerOnErrorStrategy.DISPATCH,
						},

						stream: {
							datadogApiKey: config.get('datadog.apiKey'),
							datadogServiceName: config.get('datadog.serviceName'),
						},
					},
				};
			},
			inject: [ConfigService],
		}),
	],

	providers: [
		{
			provide: APP_INTERCEPTOR,
			useClass: GlobalInterceptor,
		},
		{
			provide: APP_FILTER,
			useClass: GlobalExceptionFilter,
		},
	],

	exports: [ConfigModule, NestLoggerModule],
})
export class GlobalModule {}

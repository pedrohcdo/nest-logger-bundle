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
	NestLoggerParamsLogggerMode,
} from 'nest-logger-bundle';

import pinoms from 'pino-multi-stream';
import datadog from 'pino-datadog';

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
			useFactory: async (config: ConfigService): Promise<NestLoggerParams> => {
				const datadogStream = await datadog.createWriteStream({
					apiKey: config.get('datadog.apiKey'),
					service: config.get('datadog.serviceName'),
				});

				return {
					loggers: {
						type: 'default',
						prettyPrint: {
							mode: NestLoggerParamsLogggerMode.LOG_LINE,
							disabled: false,
							options: {
								colorize: true,
							},
						},
						streams: {
							mode: NestLoggerParamsLogggerMode.LOG_BUNDLE,
							pinoStreams: [
								{
									stream: datadogStream,
								},
							],
						},
						timestamp: {
							format: {
								template: 'DD/MM/YYYY - HH:mm:ss.SSS',
								timezone: 'America/Sao_Paulo',
							},
						},
					},

					// You can change this
					contextBundle: {
						strategy: {
							onDispatch: NestLoggerDispatchStrategy.DISPATCH,
							level: NestLoggerLevelStrategy.MAJOR_LEVEL,
							onError: NestLoggerOnErrorStrategy.DISPATCH,
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

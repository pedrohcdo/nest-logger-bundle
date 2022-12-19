import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import environment from '../config/environment.config';
import { GlobalInterceptor } from './global-http-interceptor';
import { GlobalExceptionFilter } from './global-exception.filter';

import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { environmentSchema } from '../config/environment.schema';
import {
	LoggerBundleLevelStrategy,
	LoggerBundleModule,
	LoggerBundleParams,
	LoggerBundleParamsLogggerMode,
} from 'nest-logger-bundle';

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
		LoggerBundleModule.forRootAsync({
			isGlobal: false,
			useFactory: async (config: ConfigService): Promise<LoggerBundleParams> => {
				const datadogStream = await datadog.createWriteStream({
					apiKey: config.get('datadog.apiKey'),
					service: config.get('datadog.serviceName'),
				});

				return {
					loggers: {
						type: 'default',
						prettyPrint: {
							mode: LoggerBundleParamsLogggerMode.LOG_BUNDLE,
							disabled: false,
							options: {
								colorize: true,
								minimumLevel: 'trace', // optional
							},
						},
						streams: {
							mode: LoggerBundleParamsLogggerMode.LOG_BUNDLE,
							disabled: true,
							pinoStreams: [
								{
									stream: datadogStream,
									level: 'trace',
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

					contextBundle: {
						strategy: {
							level: LoggerBundleLevelStrategy.MAJOR_LEVEL,
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

	exports: [ConfigModule, LoggerBundleModule],
})
export class GlobalModule {}

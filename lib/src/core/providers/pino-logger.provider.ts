import { Provider } from '@nestjs/common';
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import { MODULE_OPTIONS_TOKEN } from '../../nest-logger.module-definition';
import { NestLoggerParams, PINO_LOGGER_PROVIDER_TOKEN } from '../../nest-logger.params';
import datadog from 'pino-datadog';

export const PinoLoggerProvider: Provider = {
	provide: PINO_LOGGER_PROVIDER_TOKEN,

	useFactory: async (params: NestLoggerParams) => {
		let writeStream = null;

		if(params?.contextBundle?.stream?.datadog) {
			writeStream = await datadog.createWriteStream({
				apiKey: params.contextBundle.stream.datadog.datadogApiKey,
				service: params.contextBundle.stream.datadog.datadogServiceName
			})
		}

		if(writeStream)
			return pinoms({ streams: [{ stream: writeStream }] });

		return pino({ enabled: false });
	},

	inject: [MODULE_OPTIONS_TOKEN],
};

import { Provider } from '@nestjs/common';
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import { MODULE_OPTIONS_TOKEN } from '../../nest-logger.module-definition';
import { NestLoggerParams, PINO_LOGGER_PROVIDER_TOKEN } from '../../nest-logger.params';
import datadog from 'pino-datadog';

export const PinoLoggerProvider: Provider = {
	provide: PINO_LOGGER_PROVIDER_TOKEN,

	useFactory: async (params: NestLoggerParams) => {
		if (!params.contextBundle.stream) return pino({ enabled: false });
		return pino({ enabled: false });
        const writeStream = await datadog.createWriteStream({
            apiKey: params.contextBundle.stream.datadogApiKey,
            service: params.contextBundle.stream.datadogServiceName
        })
		return pinoms({ streams: [{ stream: writeStream }] });
	},

	inject: [MODULE_OPTIONS_TOKEN],
};

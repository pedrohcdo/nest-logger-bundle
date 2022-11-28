import { Provider } from '@nestjs/common';
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import { MODULE_OPTIONS_TOKEN } from '../../nest-logger.module-definition';
import { NestLoggerParams, PINO_LOGGER_PROVIDER_TOKEN } from '../../nest-logger.params';

export const PinoLoggerProvider: Provider = {
	provide: PINO_LOGGER_PROVIDER_TOKEN,

	useFactory: async (params: NestLoggerParams) => {
		if (!params.contextBundle.stream) return pino({ enabled: false });
		const writeStream = null;
		return pinoms({ streams: [{ stream: writeStream }] });
	},

	inject: [MODULE_OPTIONS_TOKEN],
};

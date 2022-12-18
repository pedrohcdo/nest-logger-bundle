import { Provider } from '@nestjs/common';
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import { MODULE_OPTIONS_TOKEN } from '../../nest-logger.module-definition';
import { BUNDLE_LOGGER_PROVIDER_TOKEN, NestLoggerParams, NestLoggerParamsLogggerMode } from '../../nest-logger.params';
import datadog from 'pino-datadog';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'
import { resolveLoggerFor } from './utils';

dayjs.extend(utc)
dayjs.extend(timezone)

export const BundleLoggerProvider: Provider = {
	provide: BUNDLE_LOGGER_PROVIDER_TOKEN,

	useFactory: async (params: NestLoggerParams) => {
		if(params?.loggers?.type === "custom")
			return params.loggers.bundleLogger

		// If this provider takes the responsibility of logging into prettyStream or streams, 
		// then consequently the LineLoggerProvider will not receive these responsibilities and may even be disabled.
		return resolveLoggerFor(params, NestLoggerParamsLogggerMode.LOG_BUNDLE)
	},

	inject: [MODULE_OPTIONS_TOKEN],
};

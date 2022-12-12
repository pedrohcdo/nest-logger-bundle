import { Provider } from '@nestjs/common';
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import { MODULE_OPTIONS_TOKEN } from '../../nest-logger.module-definition';
import { NestLoggerParams, PINO_LOGGER_PROVIDER_TOKEN } from '../../nest-logger.params';
import datadog from 'pino-datadog';
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
import timezone from 'dayjs/plugin/timezone'

dayjs.extend(utc)
dayjs.extend(timezone)

export const PinoLoggerProvider: Provider = {
	provide: PINO_LOGGER_PROVIDER_TOKEN,

	useFactory: async (params: NestLoggerParams) => {
		if(params.pinoStream.type === "custom")
			return params.pinoStream.logger
		
		let streams = [];

		if(!params?.pinoStream?.prettyPrint?.disabled) {
			const prettyStream = pinoms.prettyStream({
				prettyPrint: params?.pinoStream?.prettyPrint?.options || {}
			})
			streams.push({ 
				stream: prettyStream
			})
		}

		if(params?.pinoStream?.streams) {
			streams.push(...params?.pinoStream?.streams)
		}

		if(streams.length > 0) {

			let timestampFunction: any = pino.stdTimeFunctions.epochTime
			if(params?.pinoStream?.timestamp) {
				const timestamp = params.pinoStream.timestamp;

				if(timestamp.disabled) {
					timestampFunction = false;
				} else if(timestamp.format) {
					timestampFunction = () => {
						return `, "time":"${dayjs().tz(timestamp.format.timezone).format(timestamp.format.template)}"`
					}
				}
			}

			return pinoms({ 
				streams: streams ,
				timestamp: timestampFunction
			});

		
		}

		return pino({ enabled: false });
	},

	inject: [MODULE_OPTIONS_TOKEN],
};

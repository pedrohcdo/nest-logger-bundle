import pino from 'pino'
export const PINO_HTTP_PROVIDER_TOKEN = 'STREAM_LOGGER_PROVIDER_TOKEN'


export interface NestLoggerParams {

	pinoHttp?: {
		level?: string
		logger?: pino.Logger
	}

}

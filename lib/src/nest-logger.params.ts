import pino from 'pino'
import { PinoLevels } from './bundle/context/logger.definitions'
export const PINO_LOGGER_PROVIDER_TOKEN = 'PINO_LOGGER_PROVIDER_TOKEN'
export const ROOT_LOGGER_PROVIDER_TOKEN = 'ROOT_LOGGER_PROVIDER_TOKEN'

export enum NestLoggerDispatchStrategy {
	DISCARD = 0,
	DISPATCH = 1,
}

export enum NestLoggerLevelStrategy {
	MINOR_LEVEL = 0,
	MAJOR_LEVEL = 1,
	LAST_LEVEL = 2,
}

export enum NestLoggerOnErrorStrategy {
	DISPATCH = 0,
}

export enum NestLoggerChanelsMode { 


}

export interface LoggerModuleAsyncParams {

	useFactory: (...args: any[]) => NestLoggerParams | Promise<NestLoggerParams>
	inject?: any[]
}

export interface NestLoggerParamsContextBundleStrategy {
	level?: NestLoggerLevelStrategy
	onDispatch?: NestLoggerDispatchStrategy
	onError?: NestLoggerOnErrorStrategy

}

export interface NestLoggerParamsContextBundleStreamDatadog {
	datadog: {
		datadogApiKey: string
		datadogServiceName: string
	}
}

export interface NestLoggerParamsPinoHttp {
	level?: string
	logger?: pino.Logger
}

export interface NestLoggerParamsContextBundle {
	defaultLevel?: PinoLevels
	strategy?: NestLoggerParamsContextBundleStrategy
	stream?: NestLoggerParamsContextBundleStreamDatadog
}

export interface NestLoggerParams {
	pinoHttp?: NestLoggerParamsPinoHttp
	contextBundle?: NestLoggerParamsContextBundle
}

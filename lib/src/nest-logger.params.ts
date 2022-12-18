import pino from 'pino'
import pinoms from 'pino-multi-stream'
import { PinoLevels } from './bundle/context/logger.definitions'

export const BUNDLE_LOGGER_PROVIDER_TOKEN = 'BUNDLE_LOGGER_PROVIDER_TOKEN'
export const LINE_LOGGER_PROVIDER_TOKEN = 'LINE_LOGGER_PROVIDER_TOKEN'

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

export interface LoggerModuleAsyncParams {

	useFactory: (...args: any[]) => NestLoggerParams | Promise<NestLoggerParams>
	inject?: any[]
}

export interface NestLoggerParamsContextBundleStrategy {
	level?: NestLoggerLevelStrategy
	onDispatch?: NestLoggerDispatchStrategy
	onError?: NestLoggerOnErrorStrategy

}

export enum NestLoggerParamsLogggerMode {

	LOG_BUNDLE = 1,

	LOG_LINE = 2
}


export interface NestLoggersParamsPretty {

	disabled?: boolean
	options?: pino.PrettyOptions
	mode?: NestLoggerParamsLogggerMode
}

export interface NestLoggerParamsPinoTimestampFormat {

	template: string
	timezone: string
}

export interface NestLoggersParamsTimestamp {

	disabled?: boolean,
	format?: NestLoggerParamsPinoTimestampFormat
}

export interface NestLoggersParamsStreams {

	pinoStreams?: pinoms.Streams
	mode?: NestLoggerParamsLogggerMode
}


export interface NestLoggersParamsCustom {
	type: "custom"
	level?: string
	bundleLogger: pino.Logger
	prettyLogger?: pino.Logger
}

export interface NestLoggersParamsStream {
	type: "default"
	prettyPrint?: NestLoggersParamsPretty
	streams?: NestLoggersParamsStreams
	timestamp?: NestLoggersParamsTimestamp
}

export interface NestLoggerParamsContextBundle {
	defaultLevel?: PinoLevels
	strategy?: NestLoggerParamsContextBundleStrategy
}

export interface NestLoggerParams {
	loggers?: NestLoggersParamsStream | NestLoggersParamsCustom
	contextBundle?: NestLoggerParamsContextBundle
}

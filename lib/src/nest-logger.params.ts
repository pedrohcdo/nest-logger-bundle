import { RouteInfo, Type } from '@nestjs/common/interfaces'
import pino from 'pino'
import pinoms from 'pino-multi-stream'
import { PinoLevels } from './bundle/context/logger.definitions'

export const BUNDLE_LOGGER_PROVIDER_TOKEN = 'BUNDLE_LOGGER_PROVIDER_TOKEN'
export const LINE_LOGGER_PROVIDER_TOKEN = 'LINE_LOGGER_PROVIDER_TOKEN'

export enum NestLoggerLevelStrategy {
	MINOR_LEVEL = 0,
	MAJOR_LEVEL = 1,
	LAST_LEVEL = 2,
}

export interface LoggerModuleAsyncParams {

	useFactory: (...args: any[]) => NestLoggerParams | Promise<NestLoggerParams>
	inject?: any[]
}

export interface NestLoggerParamsContextBundleStrategy {
	level?: NestLoggerLevelStrategy
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

	disabled?: boolean
	pinoStreams?: pinoms.Streams
	mode?: NestLoggerParamsLogggerMode
}


export interface NestLoggersParamsCustom {
	type: "custom"
	level?: string
	bundleLogger: pino.Logger
	lineLogger?: pino.Logger
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
	forRoutes?: (string | Type<any> | RouteInfo)[]
}

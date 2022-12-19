import { RouteInfo, Type } from '@nestjs/common/interfaces'
import pino from 'pino'
import pinoms from 'pino-multi-stream'
import { PinoLevels } from './bundle/context/logger.definitions'

export const BUNDLE_LOGGER_PROVIDER_TOKEN = 'BUNDLE_LOGGER_PROVIDER_TOKEN'
export const LINE_LOGGER_PROVIDER_TOKEN = 'LINE_LOGGER_PROVIDER_TOKEN'

export enum LoggerBundleLevelStrategy {
	MINOR_LEVEL = 0,
	MAJOR_LEVEL = 1,
	LAST_LEVEL = 2,
}

export interface LoggerModuleAsyncParams {

	useFactory: (...args: any[]) => LoggerBundleParams | Promise<LoggerBundleParams>
	inject?: any[]
}

export interface LoggerBundleParamsContextBundleStrategy {
	level?: LoggerBundleLevelStrategy
}

export enum LoggerBundleParamsLogggerMode {

	LOG_BUNDLE = 1,

	LOG_LINE = 2
}


export interface LoggerBundleParamsPretty {

	disabled?: boolean
	options?: pino.PrettyOptions
	mode?: LoggerBundleParamsLogggerMode
}

export interface LoggerBundleParamsPinoTimestampFormat {

	template: string
	timezone: string
}

export interface LoggerBundleParamsTimestamp {

	disabled?: boolean,
	format?: LoggerBundleParamsPinoTimestampFormat
}

export interface LoggerBundleParamsStreams {

	disabled?: boolean
	pinoStreams?: pinoms.Streams
	mode?: LoggerBundleParamsLogggerMode
}


export interface LoggerBundleParamsCustom {
	type: "custom"
	bundleLogger: pino.Logger
	lineLogger?: pino.Logger
}

export interface LoggerBundleParamsStream {
	type: "default"
	prettyPrint?: LoggerBundleParamsPretty
	streams?: LoggerBundleParamsStreams
	timestamp?: LoggerBundleParamsTimestamp
}

export interface LoggerBundleParamsContextBundle {
	defaultLevel?: PinoLevels
	strategy?: LoggerBundleParamsContextBundleStrategy
}

export interface LoggerBundleParams {
	loggers?: LoggerBundleParamsStream | LoggerBundleParamsCustom
	contextBundle?: LoggerBundleParamsContextBundle
	forRoutes?: (string | Type<any> | RouteInfo)[]
}

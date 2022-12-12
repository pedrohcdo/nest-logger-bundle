import pino from 'pino'
import pinoms from 'pino-multi-stream'
import { PinoLevels } from './bundle/context/logger.definitions'
export const PINO_LOGGER_PROVIDER_TOKEN = 'PINO_LOGGER_PROVIDER_TOKEN'

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

export interface NestLoggerParamsPrettyStream {

	disabled?: boolean
	options?: pino.PrettyOptions
}

export interface NestLoggerParamsPinoTimestampFormat {

	template: string
	timezone: string
}

export interface NestLoggerParamsPinoTimestamp {

	disabled?: boolean,
	format?: NestLoggerParamsPinoTimestampFormat
}

export interface NestLoggerParamsCustomPino {
	type: "custom"
	level?: string
	logger: pino.Logger
}

export interface NestLoggerParamsPinoStream {
	type: "default"
	prettyPrint?: NestLoggerParamsPrettyStream
	streams?: pinoms.Streams
	timestamp?: NestLoggerParamsPinoTimestamp
}

export interface NestLoggerParamsContextBundle {
	defaultLevel?: PinoLevels
	strategy?: NestLoggerParamsContextBundleStrategy
}

export interface NestLoggerParams {
	pinoStream?: NestLoggerParamsPinoStream | NestLoggerParamsCustomPino
	contextBundle?: NestLoggerParamsContextBundle
}

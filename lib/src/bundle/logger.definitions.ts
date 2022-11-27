import pino from 'pino';

export type PinoMethods = Pick<pino.Logger, 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal'>;

export type LoggerFunction =
	| ((msg: string, ...args: any[]) => void)
	| ((obj: object, msg?: string, ...args: any[]) => void);

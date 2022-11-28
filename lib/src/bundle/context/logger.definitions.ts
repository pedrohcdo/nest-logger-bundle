import pino from 'pino';

export type PinoLevels = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type PinoMethods = Pick<pino.Logger, PinoLevels>;

export type LoggerFunction =
	| ((msg: string, ...args: any[]) => void)
	| ((obj: object, msg?: string, ...args: any[]) => void);

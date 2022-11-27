import { LoggerFunction, PinoMethods } from "./logger.definitions";

export class DummyLogger implements PinoMethods {

    setContextToken(_: string) {}

    enter(_: string) {}

    trace(msg: string, ...args: any[]): void;
    trace(obj: unknown, msg?: string, ...args: any[]): void;
    trace(..._: Parameters<LoggerFunction>) {}

    debug(msg: string, ...args: any[]): void;
    debug(obj: unknown, msg?: string, ...args: any[]): void;
    debug(..._: Parameters<LoggerFunction>) {}

    info(msg: string, ...args: any[]): void;
    info(obj: unknown, msg?: string, ...args: any[]): void;
    info(..._: Parameters<LoggerFunction>) {}

    warn(msg: string, ...args: any[]): void;
    warn(obj: unknown, msg?: string, ...args: any[]): void;
    warn(..._: Parameters<LoggerFunction>) {}

    error(msg: string, ...args: any[]): void;
    error(obj: unknown, msg?: string, ...args: any[]): void;
    error(..._: Parameters<LoggerFunction>) {}

    fatal(msg: string, ...args: any[]): void;
    fatal(obj: unknown, msg?: string, ...args: any[]): void;
    fatal(..._: Parameters<LoggerFunction>) {}

    exit() {}
}
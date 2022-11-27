import format from "quick-format-unescaped";
import { LoggerFunction } from "./logger.definitions";

export class NestLoggerUtils {

    private constructor() {}

    static parseLoggedParamsToObject(log: Parameters<LoggerFunction>) {
        if(typeof log[0] === 'object') {
            if(log[0] instanceof Error) {
                return {
                    message: format(log[1], log.slice(2)),
                    error: log[0]
                };
            } else {
                return Object.assign({
                    message: format(log[1], log.slice(2))
                }, log[0]);
            }
        } else {
            return {
                message: format(log[0], log.slice(1))
            };
        }
    }
}
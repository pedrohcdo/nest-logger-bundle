import { Provider, Scope } from "@nestjs/common";
import { NestLoggerParams, ROOT_LOGGER_PROVIDER_TOKEN } from "../nest-logger.params";
import pino from "pino";
import { MODULE_OPTIONS_TOKEN } from "../nest-logger.module-definition";

export const RootLoggerProvider: Provider = {
    provide: ROOT_LOGGER_PROVIDER_TOKEN,
    
    useFactory: (params: NestLoggerParams) => {
        if(params.pinoHttp.logger)
            return params.pinoHttp.logger;
        //
        return pino({
            ...params.pinoHttp,
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true
                }
            }
        });
    },
    
    inject: [MODULE_OPTIONS_TOKEN]
};
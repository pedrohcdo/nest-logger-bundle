import { Provider } from "@nestjs/common";
import { NestLoggerParams, PINO_LOGGER_PROVIDER_TOKEN } from "../nest-logger.params";
import pino from 'pino';
import pinoms from 'pino-multi-stream';
import { MODULE_OPTIONS_TOKEN } from "../nest-logger.module-definition";

export const PinoLoggerProvider: Provider = {
    provide: PINO_LOGGER_PROVIDER_TOKEN,

    useFactory: async (params: NestLoggerParams) => {
        if(!params.contextBundle.stream)
            return pino({enabled: false});
        const writeStream = null
        return pinoms({ streams: [{ stream: writeStream }] })
    },
    
    inject: [MODULE_OPTIONS_TOKEN]
}

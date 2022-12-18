import dayjs from "dayjs";
import pino from "pino";
import pinoms from "pino-multi-stream";
import { NestLoggerParams, NestLoggerParamsLogggerMode, NestLoggersParamsStream } from "../../nest-logger.params";

export const resolveLoggerFor = async (params: NestLoggerParams, designatedMode: NestLoggerParamsLogggerMode) => {
    const loggers = params?.loggers as NestLoggersParamsStream

    let streams = [];

    // Default is LOG_BUNDLE
    if(!loggers?.prettyPrint?.disabled && (loggers?.prettyPrint?.mode || NestLoggerParamsLogggerMode.LOG_BUNDLE) === designatedMode) {
        const prettyStream = pinoms.prettyStream({
            prettyPrint: loggers?.prettyPrint?.options || {}
        })
        streams.push({ 
            stream: prettyStream,
        })
    }

    // Default is LOG_BUNDLE
    if(loggers?.streams && (loggers?.streams?.mode || NestLoggerParamsLogggerMode.LOG_BUNDLE) === designatedMode) {
        streams.push(...loggers?.streams.pinoStreams)
    }

    if(streams.length > 0) {

        let timestampFunction: any = pino.stdTimeFunctions.epochTime

        if(loggers?.timestamp) {
            const timestamp = loggers.timestamp;

            if(timestamp.disabled) {
                timestampFunction = false;
            } else if(timestamp.format) {
                timestampFunction = () => {
                    return `, "time":"${dayjs().tz(timestamp.format.timezone).format(timestamp.format.template)}"`
                }
            }
        }

        return pinoms({ 
            streams: streams ,
            timestamp: timestampFunction
        });

    
    }

    return pino({ enabled: false });
}
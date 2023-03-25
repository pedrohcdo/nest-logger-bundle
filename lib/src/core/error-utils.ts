import { HttpStatus } from "@nestjs/common";
import { MESSAGES } from "@nestjs/core/constants";

export interface LoggerErrorObjectAxios {
    
    config: any
    responseData: any
}

export type LogErrorObjectMessage = string | string[] | { cause: string, response: string[] | string }

export interface LoggerErrorObject {

    status: number
    message: LogErrorObjectMessage
    name?: string
    axios?: LoggerErrorObjectAxios
    stack: string

    getStatus: () => number
    getMessage: () => LogErrorObjectMessage
    getCauseMessage: () => string
}

export class ErrorUtils {

    private constructor() {}

    private static resolveExceptionMessage(exception: any): LogErrorObjectMessage {
		const causeMessage = exception.message || exception.cause?.message
        const responseMessage = exception.response?.message

        if(!causeMessage || !responseMessage)
            return causeMessage || responseMessage || MESSAGES.UNKNOWN_EXCEPTION_MESSAGE
        
        return {
            cause: causeMessage,
            response: responseMessage
        }
    }

    static exceptionToErrorObject(exception: any): LoggerErrorObject {
        if(!exception) {
            return {
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: "Undefined",
                stack: "",
                getStatus: () => HttpStatus.INTERNAL_SERVER_ERROR,
                getMessage: () => "",
                getCauseMessage: () => ""
            }
        }

		const status = (exception.getStatus && exception.getStatus()) || exception.status || exception.cause?.status || exception.response?.statusCode || HttpStatus.INTERNAL_SERVER_ERROR

        const message = ErrorUtils.resolveExceptionMessage(exception)

        const name = exception.name || exception.cause?.name ||  MESSAGES.UNKNOWN_EXCEPTION_MESSAGE

        const stack = exception.stack || exception.cause?.stack || "< UNKNOWN EXCEPTION STACK >"

        const config = exception.config || exception.cause?.config;
        const responseData = exception.response?.data || exception.cause?.response?.data;

        return {
            status,
            message,
            name,
            stack,
            axios: {
                config,
                responseData 
            },

            getStatus: () => status,
            getMessage: () => message,
            getCauseMessage() {
                if(typeof message === 'string') {
                    return message;
                } else if(Array.isArray(message)) {
                    return message[0]
                } else {
                    return message.cause
                }
            }
        }
    }
}
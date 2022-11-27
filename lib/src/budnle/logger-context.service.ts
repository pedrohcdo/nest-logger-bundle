import { Inject, Injectable } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import pino from "pino";
import { NestLoggerStorage } from "../middleware/async-logger.hook";
import { MODULE_OPTIONS_TOKEN } from "../nest-logger.module-definition";
import { NestLoggerDispatchStrategy, NestLoggerParams, PINO_LOGGER_PROVIDER_TOKEN } from "../nest-logger.params";
import { LoggerBundle } from "./logger-bundle.service";

@Injectable()
export class LoggerContext {

    private detachedContext: {
        logger: pino.Logger,
        reqId: string,
        loggerBundle: LoggerBundle
    };

    constructor(
        @Inject(MODULE_OPTIONS_TOKEN) private params: NestLoggerParams,
        @Inject(PINO_LOGGER_PROVIDER_TOKEN) private streamLogger: pino.Logger,
        private moduleRef: ModuleRef
    ) {}

    getCurrent() {
        if(this.detachedContext) 
            return this.detachedContext;
        
        if(!this.hasContext()) {
            return null;
        }

        const fromStore = NestLoggerStorage.getStore();

        return {
            logger: fromStore.logger,
            reqId: fromStore.reqId,
            loggerBundle: fromStore.loggerContext
        }
    }

    // innerObject can be string, exception or object with extra fields to will be binding with log
    dispatchCurrentLoggerBundle(message: string): void;
    dispatchCurrentLoggerBundle(innerObject: unknown, message?: string): void;
    dispatchCurrentLoggerBundle(innerObject: unknown, message?: string) {
        if(!this.hasContext()) {
            return;
        }

        const { logger, loggerBundle } = this.getCurrent();
        
        //
        if(this.params.contextBundle.strategy.onDispatch === NestLoggerDispatchStrategy.DISPATCH) {
            const { object, level } = loggerBundle.build();
            
            //
            const childLogger = logger.child(object);
            if(message) childLogger[level](innerObject, message)
            else childLogger[level](innerObject)
            childLogger.flush(); // force even with sync
        }

        loggerBundle.expireNow();
    }

    hasContext() {
        return !!NestLoggerStorage.getStore();
    }

    /**
     * Creates a new instance of LoggerContext from the current one, 
     * also cloning the current state
     */
    async createDetachedContext(): Promise<LoggerContext> {

        const context = await this.moduleRef.create(LoggerContext);
        const detachedLoggerBundle = await this.moduleRef.create(LoggerBundle);

        let getFrom: {
            logger: pino.Logger,
            reqId: string,
            loggerBundle: LoggerBundle
        }

        if(this.detachedContext) {
            getFrom = this.detachedContext;
        } else if(this.hasContext()) {
            getFrom = this.getCurrent();
        } else {
            getFrom = {
                logger: this.streamLogger,
                loggerBundle: null,
                reqId: "<unknown>"
            }
        }

        const { logger, loggerBundle, reqId } = getFrom;
        
        if(loggerBundle)
            detachedLoggerBundle.copyFrom(loggerBundle);

        context.detachedContext = {
            logger,
            loggerBundle: detachedLoggerBundle,
            reqId
        }

        return context;
    }
}
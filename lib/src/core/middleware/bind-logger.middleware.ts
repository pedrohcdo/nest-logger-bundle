import { Injectable, NestMiddleware } from '@nestjs/common';
import { BundleLoggerStorage, BundleLoggerStore } from '../../bundle/context/async-logger.hook';
import { NestLoggerBundle } from '../../bundle/logger-bundle.service';
import { NextFunction, Request, Response } from 'express';

const NEST_LOGGER_REQ_ID_PREFIX = "NEST_LOGGER_REQ_";

@Injectable()
export class LoggerBundleHookMiddleware implements NestMiddleware {

    constructor(private loggerContext: NestLoggerBundle) {}

    //
    use(request: Request, _: Response, next: NextFunction) {
        //
        BundleLoggerStorage.run(new BundleLoggerStore(this.loggerContext, `${NEST_LOGGER_REQ_ID_PREFIX}${request.id}`, request.log), 
            async () => {
                next();
            }
        );
    }
}
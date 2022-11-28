import { Injectable, NestMiddleware } from '@nestjs/common';
import { NestLoggerStorage, NestLoggerStore } from '../../bundle/context/async-logger.hook';
import { NestLoggerBundle } from '../../bundle/logger-bundle.service';
import { NextFunction, Request, Response } from 'express';

const NEST_LOGGER_REQ_ID_PREFIX = "NEST_LOGGER_REQ_";

@Injectable()
export class NestLoggerHookMiddleware implements NestMiddleware {

    constructor(private loggerContext: NestLoggerBundle) {}

    //
    use(request: Request, _: Response, next: NextFunction) {
        //
        NestLoggerStorage.run(new NestLoggerStore(this.loggerContext, `${NEST_LOGGER_REQ_ID_PREFIX}${request.id}`, request.log), 
            async () => {
                next();
            }
        );
    }
}
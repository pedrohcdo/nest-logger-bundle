import { Inject, Injectable, Scope } from "@nestjs/common";
import { NestLoggerParams } from "../nest-logger.params";
import pino from 'pino';
import { LoggerBindings, LoggerBindingsContext, LoggerBranch, LoggerLeaf } from "./logger-branch";
import { MODULE_OPTIONS_TOKEN } from "../nest-logger.module-definition";
import { LoggerFunction } from "./logger.definitions";

export class LoggableBundleObject {
    
    object: any;
    level: string;
}

@Injectable({
    scope: Scope.REQUEST
})
export class LoggerBundle {

    private expired: boolean = false;
    private currentBranch: LoggerBranch;
    private bindings: LoggerBindings;

    constructor(@Inject(MODULE_OPTIONS_TOKEN) private params: NestLoggerParams) {
        this.currentBranch = new LoggerBranch(null, 'root');
        this.bindings = {
            tgContext: {

            },
            tgTags: {

            }
        }
    }

    setContext(context: LoggerBindingsContext) {
       Object.assign(this.bindings.tgContext, context);
    }

    putTag(tag: string, value: string) {
        this.bindings.tgTags[tag] = value;
    }

    copyFrom(otherBundle: LoggerBundle) {
        this.currentBranch = otherBundle.getRootBranch().clone() as LoggerBranch;
        this.bindings = {
            tgContext: Object.assign({}, otherBundle.bindings.tgContext),
            tgTags: Object.assign({}, otherBundle.bindings.tgTags)
        }
    }

    enter(branchName: string) {
        this.currentBranch = this.currentBranch.enter(branchName);
    }

    log(level: pino.Level, msg: string, ...args: any[]): void;
    log(level: pino.Level, obj: unknown, msg?: string, ...args: any[]): void;
    log(level: pino.Level, ...params: Parameters<LoggerFunction>) {
        this.currentBranch.log(level, ...params);
    }

    exit() {
        if(!this.currentBranch.parent)
            throw Error("Could not close current branch.")
        this.currentBranch = this.currentBranch.exit();
    }

    private getRootBranch() {
        let current = this.currentBranch;
        while(current.parent) {
            current = current.parent;
        }
        return current;
    }

    build(): LoggableBundleObject {

        // Exit root branch
        while(this.currentBranch.parent) {
            this.currentBranch = this.currentBranch.exit();
        }
        this.currentBranch.exit();

        ///
        const bindings = {
            tgContext: Object.assign({
                requestDuration: this.currentBranch.profiling(),
            }, this.bindings.tgContext),

            tgTags: Object.assign({}, this.bindings.tgTags)
        }
        delete bindings.tgContext.response;

        if(this.bindings.tgContext.response) {
            Object.assign(bindings, {
                res: this.bindings.tgContext.response
            })
        }

        //
        const object = {
            logs: this.currentBranch.toObject(),
            ...bindings,
        };
        const level = this.currentBranch.introspectLevel(this.params.contextBundle.strategy.level, this.params.contextBundle.defaultLevel);
  
        //
        return {
            object,
            level
        }
    }

    expireNow() {
        this.expired = true;
    }

    isExpired() {
        return this.expired;
    }
   
}
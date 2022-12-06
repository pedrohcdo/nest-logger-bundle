<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="" width="120" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

  <p align="center">A flexible Logger created to use with <a href="http://nodejs.org" target="blank">Nest.js</a> framework for wrap all logs with an Request or Async context in a bundle.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore"><img src="https://img.shields.io/npm/dm/@nestjs/core.svg" alt="NPM Downloads" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://api.travis-ci.org/nestjs/nest.svg?branch=master" alt="Travis" /></a>
<a href="https://travis-ci.org/nestjs/nest"><img src="https://img.shields.io/travis/nestjs/nest/master.svg?label=linux" alt="Linux" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#5" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://twitter.com/nestframework"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow"></a>
</p>

## Description

This library made to be used with <a href="http://nodejs.org" target="blank">Nest.js</a> it offers more flexibility for controlling logs in the application. The strongest point is that it offers a way to pack all the logs originating from an request or some asynchronous flow into a single bundle, later it provides ways to transmit the bundles to some cloud observability service.

Don't worry about the destination of the logs, that's the mission of the NestLogBundle. :)

There is currently a base made using the pino library, 

________________

## Internal Dependencies

You don't need to install any extra dependencies. Internally this library is also made using some bases that are made on top of the <a href="https://github.com/pinojs/pino" target="blank">pino</a>, but I have plans to expose this dependencies in the future and leave the user free to choose which one to use.

________________

## Installation

```bash
$ npm i --save @pedrohcd/nest-logger-bundle
```

## Samples

________________

If you want to see some usage examples use this repo <a href="https://github.com/pedrohcdo/nest-logger-bundle-samples" target="blank">NestLoggerBundleSamples</a>, In it you will find some projects with some use cases, the codes are commented for a better understanding.

> If you want to see an simple example of how to configure it, see the test project [Example](test).

________________

## How to use



First we need to import the NestLoggerModule module in the module we want to use.

> In my projects I usually import the 'NestLoggerModule' module in a global module that puts all the main dependencies of the project and also export the 'NestLoggerModule' to be visible to any other module as shown in the example project.


Follow the minimum configuration:

```ts
import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import {
  NestLoggerModule,
  LoggerExceptionFilter,
  LoggerHttpInterceptor
} from '@pedrohcd/nest-logger';


//
@Global()
@Module({
  imports: [
    // .. imports

   NestLoggerModule.forRoot({})
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: LoggerExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggerHttpInterceptor,
    },
  ],

  exports: [NestLoggerModule /**, ... others exports */],
})
export class GlobalModule {}

```

For the LoggerBundle to work correctly, two important points need to be connected, which is the request interceptor and the application's exception filter. 
By default this library provides two classes to correctly handle these ends, as shown in the example above `LoggerExceptionFilter` and `LoggerHttpInterceptor`.

### Configurações disponíveis:

The NestLoggerModule provides two ways of configuration, they are `NestLoggerModule.forRoot(config)` and `NestLoggerModule.forRootAsync(options)`, where:

- Config Object example:

  *NestLoggerParams*
  ```ts
  {
    pinoHttp?: {
      level?: string // 
      logger?: pino.Logger
    },

    contextBundle: {
      defaultLevel?: PinoLevels

      strategy?: {
        level?: NestLoggerLevelStrategy
        onDispatch?: NestLoggerDispatchStrategy
        onError?: NestLoggerOnErrorStrategy
      }

      stream?: {
        datadogApiKey: string,
        datadogServiceName: string
      }
    }
  }
  ```

- Option Object example:

  ```ts
  {
    isGlobal: boolean,
    useFactory: (config: ConfigService): NestLoggerParams => {
      return /** return an Config Object */
    },
    inject: [ConfigService],
  }
  ```



______

### Custom `LoggerExceptionFilter` and `LoggerHttpInterceptor`

In some cases you will need to implement these two classes for some kind of treatment of your application, that way you can extend these classes as in the example below.
`exemple-global-exception-filter.ts`

```ts
import { ArgumentsHost, Catch } from '@nestjs/common';
import { LoggerExceptionFilter } from '@pedrohcd/nest-logger';

@Catch()
export class GlobalExceptionFilter extends LoggerExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    super.catch(exception, host);
  }
}

```

`exemple-http-interceptor.ts`
```ts
import { CallHandler, Catch, ExecutionContext } from '@nestjs/common';
import { LoggerHttpInterceptor } from '@pedrohcd/nest-logger';
import { Observable } from 'rxjs';

@Catch()
export class GlobalInterceptor extends LoggerHttpInterceptor {
	intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
		return super.intercept(context, next);
	}
}
```

`global-module.ts`
```ts
import { Global, Module } from '@nestjs/common';
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './exemple-global-exception-filter.ts'
import { GlobalInterceptor } from './exemple-http-interceptor.ts'
import {
  NestLoggerModule,
} from '@pedrohcd/nest-logger';


//
@Global()
@Module({
  imports: [
    // .. imports

   NestLoggerModule.forRoot({})
  ],

  providers: [
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: GlobalInterceptor,
    },
  ],

  exports: [NestLoggerModule /**, ... others exports */],
})
export class GlobalModule {}

```


## Stay in touch

- Author - [Pedro Henrique C.](https://github.com/pedrohcdo)

## License

NestLoggerBundle is [MIT licensed](LICENSE).

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

This library made to be used with <a href="http://nodejs.org" target="blank">Nest.js</a> it offers more flexibility for controlling logs in the application. The strongest point is that it offers a way to pack all the logs originating from an request or some asynchronous flow into a single bundle, also later it provides ways to transport the bundles to some cloud observability service.

For example, in a request several logs can occur and organizing this later or finding yourself in the middle of so many logs becomes a complicated task, with the LoggerBundle all the logs that occur in that request will be packed in a bundle and this bundle shows exactly the order that these logs were displayed in a tree, you can even create branches of these logs using the `enter()/ exit()` methods as will be explained later. This bundle will include a lot of useful information, such as the request that originated these logs and in the log tree you will be able to see a time profiling telling you how long it took in each branch tree.


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

First we need to import the NestLoggerModule module in the module we want to use. Follow the minimum configuration:

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
For the LoggerBundle to work correctly, it needs some points to be handled, for that there are two classes that are used to handle requests and errors, they are: `LoggerExceptionFilter` and `LoggerHttpInterceptor`.
These classes need to be used in the global-scoped filters and interceptors like the example to be work across the whole application. `Remember to provide this filter and interceptor as in the example above in a global module or in the main module of your application.`

> If you already have a global scope filter or interceptor, follow the [tutorial](#custom-filter-and-interceptor)

### Injecting LoggerBundle

To inject the Logger in some injectable service of your project follow the example below

```ts
import { Injectable } from '@nestjs/common'
import { NestLoggerService } from '@pedrohcd/nest-logger';

@Injectable()
export class SampleUserRepository {

  constructor(private logService: NestLoggerService) {
    this.logService.setContextToken(SampleUserRepository.name)
  }

  async findUserByEmail(email: string){
    this.logService.enter('finding user by email ', email)
    this.logService.log('finding...')
    // ....
    this.logService.exit()

    return null;
  }

  async saveUser(email: string, username: string){
    this.logService.enter('creating user', email, username)
    this.logService.log('creating...')
    // ...
    this.logService.exit()

    return {}
  }
}

@Injectable()
export class SampleUserService {

  constructor(
    private userRepo: SampleUserRepository,
    private logService: NestLoggerService
  ) {
    this.logService.setContextToken(SampleService.name)
  }

  async createUser(email: string, username: string){
    this.logService.log('creating user')

    const user = await this.userRepo.findUserByEmail(email);

    if(!user) {
      await this.userRepo.saveUser(email, username);
    } else {
       this.logService.log('A user with that email already exists')
    }
  }
}

```
As shown above, each service injects its LoggerBundle, you don't have to worry about intermittent calls between them, the LoggerBundle can find itself by the current context whether it's a request or an asynchronous flow, So if the `SampleUserService.createUser()` function from the example above is called right at the end of the call all the logs that occurred in each service will be gathered in a single tree in the bundle as in the example below

> An important point is that asynchronous function calls without an await allow the flow of a request to end even before everything is executed, in this case read the section:

> Remembering that the name of the current service can be acquired by `<Class>.name`, so you can change the name of the context of the LoggerBundle right at the beginning using as shown in the example above: `this.logService.setContextToken(SampleService.name)`

There are some methods available for use in NestLoggerService, here is a list of them

- Log Methods <br/>
  ```ts
  /** Trace Level */
  trace(...args)

  /** Debug Level */
  debug(...args)

  /** Info Level */
  info(...args)

  /** Warn Level */
  warn(...args)

  /** Error Level */
  error(...args)

  /** Fatal Level */
  fatal(...args)
  ```

  Where all log levels follow the same argument model, there are thre call combinations, here is an example with `log()` level

  ```ts
  // The first way is sending a text that can contain special characters for formatting and then the arguments referring to the formatting.
  this.logService.log("message to format %d %d", 10, 20)

  // The second form precedes an object that will be merged together with the formatted message
  this.logService.log({ example: 'hello' }, "message to format %d %d", 10, 20)

  // The third form precedes an error object that will be merged together with the formatted message
  this.logService.log(new Error('example'), "message to format %d %d", 10, 20)
  ```

- Context Methods <br/>

  There are also some methods to control the context of the logs in your project, these methods provide a simple and easy way for you to structure the logs using a log tree structure, follow available methods

  | Method | Description 
  | :--- | :----:
  | `enter(`branchName`)` | This method creates a node in the log tree where the '`branchName`' is an string that will be the name of the subtree of logs
  | `exit()` | This method closes the current subtree, remembering that the same amount opened with `enter()` must be closed with `exit()`
  | `putTag(`tagName, tagValue`)` | Where the '`tagName`' and '`tagValue`' are strings. This method adds a tag in the current context, the tags have no direct relation with the `enter()` and `exit()` methods, so regardless of the current state of the tree, the tags will be added separately in the bundle.


______

## Setting-up

  The NestLoggerModule provides two ways of configuration, they are:

- *Statically Config*<br/>
  If you want to configure it statically, just use
  
  ```ts
  NestLoggerModule.forRoot({
    // ... params
  })
  ```

- *Asynchronously Config*<br/>
  In case you want to pass the settings asynchronously
  
  ```ts
  NestLoggerModule.forRootAsync({
    isGlobal: boolean, // 
    useFactory: (config: ConfigService): NestLoggerParams => {
      return {
        // ... params
      }
    },
    inject: [ConfigService],
  })
  ```

You must provide the desired parameters for the LoggerBundle, the parameters follow the following mode

  ```ts
  // NestLoggerParams
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

### Custom Filter and Interceptor

If your application is already using a global/ interceptor scope filter, then you will probably have to extend these two classes (`LoggerExceptionFilter`, `LoggerHttpInterceptor`) as follows: 

```ts
// example-global-exception-filter.ts

import { ArgumentsHost, Catch } from '@nestjs/common';
import { LoggerExceptionFilter } from '@pedrohcd/nest-logger';

@Catch()
export class GlobalExceptionFilter extends LoggerExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    // Your treatment
    super.catch(exception, host);
  }
}

```

```ts
// example-http-interceptor.ts

import { CallHandler, Catch, ExecutionContext } from '@nestjs/common';
import { LoggerHttpInterceptor } from '@pedrohcd/nest-logger';
import { Observable } from 'rxjs';

@Injectable()
export class GlobalInterceptor extends LoggerHttpInterceptor {
  intercept(context: ExecutionContext, next: CallHandler<any>): Observable<any> | Promise<Observable<any>> {
    // Your treatment
    return super.intercept(context, next);
  }
}
```

```ts
// example.ts
// ...
import { APP_FILTER, APP_INTERCEPTOR } from '@nestjs/core';
import { GlobalExceptionFilter } from './example-global-exception-filter.ts'
import { GlobalInterceptor } from './example-http-interceptor.ts'

//
@Module({
  
  // ...
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

  // ..
})
// ..
```

### 


## Stay in touch

- Author - [Pedro Henrique C.](https://github.com/pedrohcdo)

## License

NestLoggerBundle is [MIT licensed](LICENSE).

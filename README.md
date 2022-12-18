<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="" width="120" alt="Nest Logo" /></a>
</p>

[travis-image]: https://api.travis-ci.org/nestjs/nest.svg?branch=master
[travis-url]: https://travis-ci.org/nestjs/nest
[linux-image]: https://img.shields.io/travis/nestjs/nest/master.svg?label=linux
[linux-url]: https://travis-ci.org/nestjs/nest

<p align="center">A flexible Logger created to use with <a href="http://nodejs.org" target="blank">Nest.js</a> framework for wrap all logs with an Request or Async context in a bundle.</p>
<p align="center">
  <a href="https://www.npmjs.com/package/nest-logger-bundle"><img src="https://img.shields.io/npm/v/nest-logger-bundle" alt="NPM Version" /></a>
  <a href="https://github.com/pedrohcdo/nest-logger-bundle/blob/master/LICENSE"><img src="https://img.shields.io/github/license/pedrohcdo/nest-logger-bundle" alt="Package License" /></a>
  <a href="https://snyk.io/test/github/pedrohcdo/nest-logger-bundle">
    <img alt="Snyk Vulnerabilities for npm package" src="https://img.shields.io/snyk/vulnerabilities/npm/nest-logger-bundle" />
  </a>
  <img alt="Libraries.io" src="https://img.shields.io/librariesio/release/npm/nest-logger-bundle">
  <img alt="Supported platforms: Express & Fastify" src="https://img.shields.io/badge/platforms-Express%20%26%20Fastify-green" />
</p>

## Description

This library made to be used with <a href="http://nodejs.org" target="blank">Nest.js</a> it offers more flexibility for controlling logs in the application. The strongest point is that it offers a way to pack all the logs originating from an request or some asynchronous flow into a single bundle, also later it provides ways to transport the bundles to some cloud observability service.

For example, in a request several logs can occur and organizing this later or finding yourself in the middle of so many logs becomes a complicated task, with the LoggerBundle all the logs that occur in that request will be packed in a bundle and this bundle shows exactly the order that these logs were displayed in a tree, you can even create branches of these logs using the `enter()/ exit()` methods as will be explained later. This bundle will include a lot of useful information, such as the request that originated these logs and in the log tree you will be able to see a time profiling telling you how long it took in each branch tree.

Don't worry if some function of a service calls other functions of other services that contain another injected LoggerBundle, because it can find itself within the current context of the request, so no matter how many different services interact, the output will be in the same bundle.

________________

## Internal Dependencies

You don't need to install any extra dependencies. Internally this library is also made using some bases that are made on top of the <a href="https://github.com/pinojs/pino" target="blank">pino</a>, but I have plans to expose this dependencies in the future and leave the user free to choose which one to use.

________________

## Installation

```bash
$ npm i --save nest-logger-bundle
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
} from 'nest-logger-bundle';


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
@Injectable()
export class SampleUserService {

  constructor(
    private logService: NestLoggerService
  ) {
    this.logService.setContextToken(SampleService.name)
  }

  private async findUserByEmail(email: string){
    this.logService.enter('finding user by email ', email)
    this.logService.log('finding...')
    // ....
    this.logService.exit()

    return null;
  }

  private async saveUser(email: string, username: string){
    this.logService.enter('creating user', email, username)

    this.logService.log('checking if the user already exists...')
    const user = await this.findUserByEmail(email);

    if(!user) {
      // create user ....
      this.logService.log('user created %s %s', email, username)
    } else {
      this.logService.log('A user with that email already exists')
    }

    // ...
    this.logService.exit()

    return {}
  }

  async createUser(email: string, username: string){
    this.logService.log('log example')
    this.logService.putTag("test", "test 123")
    await this.saveUser(email, username);
  }
}

```
> An important point is that asynchronous function calls without an await allow the flow of a request to end even before everything is executed, in this case read the section [Async Call's](#async-calls)

> Remembering that the name of the current service can be acquired by `<Class>.name`, so you can change the name of the context of the LoggerBundle right at the beginning using as shown in the example above: `this.logService.setContextToken(SampleService.name)`

If the `SampleUserService.createUser(email, username)` function is called, the log structure that will be generated will be like the example below:

```json
{
  logs: {
    "profiling": "6ms",
    "name": "root",
    "logs": [
      {
        "level": "info",
        "message": "log example",
        "context": "SampleService"
      },
      {
        "profiling": "0ms",
        "name": "creating user",
        "logs": [
          {
            "level": "info",
            "message": "checking if the user with email 'teste@teste.com' already exists...",
            "context": "SampleService"
          },
          {
            "profiling": "0ms",
            "name": "finding user by email ",
            "logs": [
              {
                "level": "info",
                "message": "finding...",
                "context": "SampleService"
              }
            ]
          },
          {
            "level": "info",
            "message": "user created teste@teste.com Teste 123",
            "context": "SampleService"
          }
        ]
      }
    ]
  }
  context: {
    "requestDuration": <duration>,
    "method": "GET",
    "path": "/sample/create-user/teste%40teste.com/Teste%20123",
    "ip": <ip>
  },
  tags: {
    "test": "test 123"
  },
  req: <request object>,
  res: <response object>
}
```

The log will display 5 objects, they are:

| Object | Description 
| :--- | :----:
| `logs` | A bundle containing the entire log tree including a time profiling between each log.
| `context` | The context in which this log bundle was created, containing information such as api path, method..
| `tags` | The tags created in this context
| `req` | The body of the request that originated this bundle
| `res` | If it is a complete request context here you will be able to see the response of that request

The generated bundle follows the following structure, where the `logs` array can contain more log nodes like the example

```ts
{
  "profiling": number, // Here the overall time is displayed
  "name": "root", // The first branch is always root
  "logs": [
    // Structure of a log
    {
      "level": string,
      "message": string,
      "context": string
    },
    // Structure of an 'enter/ exit' branch
    {
      "profiling": number, // The time this node took to run
      "name": string, // The branch nrame, where it is passed on 'enter(whiteName)'
      "logs": [
        ... // Logs of this branch, remembering that it can have as many levels as necessary
      ] 
    },
    // ... others logs 
  ] 
}
```

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

- Async Methods

  If you need to make non-blocking asynchronous calls, for example calling an asynchronous function which will also perform logs without giving an `await`, so this can cause loss of logs from this asynchronous function, to solve it use the function below `(For more details read the section `[Async Call's](#async-calls)`)`

  | Method | Description 
  | :--- | :----:
  |  `createAsyncLogger()` | Creates an asynchronous LoggerBundle, where the responsibility for transporting the bundle is on your side

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

You must provide the desired parameters for the LoggerBundle, the parameters follow the following schema

```ts
// default config
{
  pinoStream: {
    type: 'default',
    prettyPrint: {
      disabled: boolean,
      options: pino.PrettyOptions,
    },
    streams: pinoms.Streams,
    timestamp: {
      format: {
        template: string,
        timezone: string,
      },
    },
  },

  // You can change this
  contextBundle: {
    strategy: {
      onDispatch: NestLoggerDispatchStrategy,
      level: NestLoggerLevelStrategy,
      onError: NestLoggerOnErrorStrategy,
    },
  }
}
```
```ts
// custom config
{
  pinoStream: {
    type: 'custom',
    logger: pino.Logger
  },

  // You can change this
  contextBundle: {
    strategy: {
      onDispatch: NestLoggerDispatchStrategy,
      level: NestLoggerLevelStrategy,
      onError: NestLoggerOnErrorStrategy,
    },
  }
}
```

Below is the description of each parameter

- **NestLoggerParams**<br/>

  | Param | Description 
  | :--- | :----:
  | `pinoStream`: NestLoggerParamsPinoStream \| NestLoggerParamsCustomPino | The NestLoggerBundle uses the `pino-multi-stream ` to transport the logs to several different destinations at the same time, for that it is necessary to use the `type: 'default'` so some parameters of `NestLoggerParamsPinoStream` will be provided, but if you choose to use a `type: 'custom'` some parameters of `NestLoggerParamsCustomPino` will be provided and you can use a pin logger configured in your own way.
  |  `contextBundle`: NestLoggerParamsContextBundle | Here you can configure some behaviors related to how the bundle is created, for example, configure what the bundle's marjoritary level will be..

- **NestLoggerParamsPinoStream**<br/>
  If you choose to use the default configuration in `NestLoggerParams`, using '`{ type: 'default', ... }`' the options for these parameters will be provided
  > It is worth remembering that it is recommended to use this configuration if you do not have the need to create your own configuration.

  | Param | Description 
  | :--- | :----:
  | `type: 'default'` | For the options to follow this pattern you must set the type to `'default'`
  | `prettyPrint`: NestLoggerParamsPrettyStream | Here you can configure `prettyStream`, choosing to disable it if necessary and also provide your `pin.PrettyOptions`
  | `streams`: pinoms.Streams | You can also tell which streams you want pinoms handles, you can find implementations of various transporters that can be used here https://github.com/pinojs/pino/blob/master/docs/transports.md#legacy
  | `timestamp`: NestLoggerParamsPinoTimestamp | You can also configure how the timestamp will be formatted in the logs informing a template and a timezone, the template is created with the help of `dayjs` to assemble the desired string you can use the symbols informed here https://day.js.org/docs/en/display/format

    - **NestLoggerParamsPrettyStream**<br/>

      | Param | Description 
      | :--- | :----:
      | `disabled`: boolean | If you want to disable the `prettyStream` you can pass `false` in this option `(remembering that, as it will be disabled the 'options' will not have any effects)`
      | `options`: pino.PrettyOptions | Here you can pass some options provided by `pin`, like `{colorize: true}`

    - **pinoms.Streams**<br/>

      Here is an example of how to use a transport `(In this example, datadog is used)`
      > To find more transporters, have a look at the pino repository in this section [Legacy](https://github.com/pinojs/pino/blob/master/docs/transports.md#legacy)

      ```ts
        import datadog from 'pino-datadog';

        // ... 
        NestLoggerModule.forRootAsync({
          useFactory: async (config: ConfigService): Promise<NestLoggerParams> => {
            const datadogStream = await datadog.createWriteStream({
              apiKey: config.get('datadog.apiKey'),
              service: config.get('datadog.serviceName'),
            });

            return {
              // ...
              pinoStream: {
                type: 'default',
                streams: [
                  {
                    stream: datadogStream,
                  },
                ],
              },
            };
          },
          inject: [ConfigService],
        }),

      ```

    - **NestLoggerParamsPinoTimestamp**<br/>

      | Param | Description 
      | :--- | :----:
      | `template`: string | To format the timezone your way, use a string that follows the pattern informed here [dayjs-formar](https://day.js.org/docs/en/display/format), eg: `'DD/MM/YYYY - HH:mm:ss.SSS'`
      | `timezone`: string | Inform the timezone, you can find the valid timezones here [IANA database](https://www.iana.org/time-zones)



- **NestLoggerParamsCustomPino**<br/>
  But if you choose to use the default configuration in `NestLoggerParamsCustomPino`, using '`{ type: 'custom', ... }`' the options for these parameters will be provided

  | Param | Description 
  | :--- | :----:
  | `type: 'custom'` | For the options to follow this pattern you must set the type to `'custom'`
  | `logger`: pino.Logger | You can pass a logger that was configured your way


### Custom Filter and Interceptor

If your application is already using a global/ interceptor scope filter, then you will probably have to extend these two classes (`LoggerExceptionFilter`, `LoggerHttpInterceptor`) as follows: 

```ts
// example-global-exception-filter.ts

import { ArgumentsHost, Catch } from '@nestjs/common';
import { LoggerExceptionFilter } from 'nest-logger-bundle';

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
import { LoggerHttpInterceptor } from 'nest-logger-bundle';
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

### Async Call's

In case you need to call some asynchronous function and not block the execution with `await` this can create a point of failure for the `LoggerBundle`, this failure is not serious but it can create confusion when interpreting the logs, this happens because a request that originated this call can end before the async function finishes, so when the request is finished the `LoggerBundle` assembles a bundle and transports it, so the async call that can still be loose and calling logging in will not be packaged in the same bundle, these logs they would be lost. For this there is a function that creates an asynchronous `LoggerBundle` and transfers you the responsibility of transporting the log at the end of the asynchronous flow. An example of usage is shown below

```ts
import { AsyncLoggerService, NestLoggerService } from 'nest-logger-bundle';

@Injectable()
export class SampleUserService {

  constructor(
    private logService: NestLoggerService
  ) {
    this.logService.setContextToken(SampleService.name)
  }

  private async saveUser(email: string, username: string){
    // Here a new LoggerBundle will be created from the context of the request
    const asyncLogger: AsyncLoggerService = await this.logService.createAsyncLogger()
		
    // codes....

    asyncLogger.log('async logs example')

    // Dispatch this loger bundle (so it can be transported, eg: to console)
    asyncLogger.dispatch("dispatch message")

    return {}
  }

  async createUser(email: string, username: string){
    this.logService.log('log example')

    /** Non-blocking, no 'await' */
    // This makes it possible for the 'createUser' function to finish before the 'saveUser' function call finishes, so the logs that will happen in the 'saveUser' function can be lost.
    this.saveUser(email, username);
  }
}

```


## Stay in touch

- Author - [Pedro Henrique C.](https://github.com/pedrohcdo)

## License

NestLoggerBundle is [MIT licensed](LICENSE).

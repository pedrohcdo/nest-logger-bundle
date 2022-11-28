import {
	Module,
} from '@nestjs/common'
import { NestAsyncLoggerContext } from './context/async-logger-context.service'
import { NestLoggerBundle } from './logger-bundle.service'


@Module({
	providers: [
        NestAsyncLoggerContext,
        NestLoggerBundle,
	],
	exports: [
        NestAsyncLoggerContext,
        NestLoggerBundle
	],
})
export class NestLoggerBundleModule {}

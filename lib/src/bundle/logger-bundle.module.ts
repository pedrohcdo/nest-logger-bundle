import { Module } from '@nestjs/common';
import { BundleAsyncLoggerContext } from './context/async-logger-context.service';
import { LoggerBundle } from './logger-bundle.service';

@Module({
	providers: [BundleAsyncLoggerContext, LoggerBundle],
	exports: [BundleAsyncLoggerContext, LoggerBundle],
})
export class NestLoggerBundleModule {}
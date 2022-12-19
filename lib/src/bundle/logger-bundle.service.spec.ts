import { REQUEST } from '@nestjs/core';
import { TestingModule } from '@nestjs/testing';
import pino from 'pino';
import { TestUtils } from 'test-utils';
import { MODULE_OPTIONS_TOKEN } from '../nest-logger.module-definition';
import {
	BUNDLE_LOGGER_PROVIDER_TOKEN,
	LINE_LOGGER_PROVIDER_TOKEN,
	LoggerBundleLevelStrategy,
} from '../nest-logger.params';
import { NestLoggerBundleModule } from './logger-bundle.module';
import { LoggerBundle } from './logger-bundle.service';

describe('NestLoggerBundle', () => {
	let module: TestingModule;
	let loggerBundle: LoggerBundle;

	beforeAll(async () => {
		//
		module = await TestUtils.createTestingModule(
			[NestLoggerBundleModule],
			[],
			[
				[REQUEST, { data: {} }],
				[
					MODULE_OPTIONS_TOKEN,
					{
						contextBundle: {
							defaultLevel: 'debug',
							strategy: {
								level: LoggerBundleLevelStrategy.MAJOR_LEVEL,
							},
						},
					},
				],
				[BUNDLE_LOGGER_PROVIDER_TOKEN, pino({ enabled: false })],
				[LINE_LOGGER_PROVIDER_TOKEN, pino({ enabled: false })],
			]
		);
	});

	beforeEach(async () => {
		loggerBundle = await module.resolve<LoggerBundle>(LoggerBundle);
	});

	describe('creating NestLoggerBundle', () => {
		it('TestingModule should be defined', async () => {
			expect(module).toBeDefined();
		});

		it('NestLoggerBundle should be defined', async () => {
			expect(loggerBundle).toBeDefined();
		});
	});
});

import { REQUEST } from '@nestjs/core';
import { Test, TestingModule } from '@nestjs/testing'
import pino from 'pino';
import { TestUtils } from 'test-utils';
import { MODULE_OPTIONS_TOKEN } from '../nest-logger.module-definition';
import { NestLoggerDispatchStrategy, NestLoggerLevelStrategy, NestLoggerOnErrorStrategy, PINO_LOGGER_PROVIDER_TOKEN } from '../nest-logger.params';
import { NestLoggerBundleModule } from './logger-bundle.module';
import { NestLoggerBundle } from './logger-bundle.service';


describe('NestLoggerBundle', () => {

	let module: TestingModule;
	let loggerBundle: NestLoggerBundle;

	beforeAll(async () => {
		// 
		module = await TestUtils.createTestingModule(
			[
				NestLoggerBundleModule
			], 
			[],
			[
				[
					REQUEST, 
					{ data: {} }
				],
				[
					MODULE_OPTIONS_TOKEN, 
					{
						contextBundle: {
							defaultLevel: 'debug',
							strategy: {
								level: NestLoggerLevelStrategy.MAJOR_LEVEL,
								onDispatch: NestLoggerDispatchStrategy.DISCARD,
								onError: NestLoggerOnErrorStrategy.DISPATCH
							}
						}
					}
				],
				[
					PINO_LOGGER_PROVIDER_TOKEN,
					pino({ enabled: false })
				]
			]
		)
	})

	beforeEach(async () => {
		loggerBundle = await module.resolve<NestLoggerBundle>(NestLoggerBundle);
	})

	describe('creating NestLoggerBundle', () => {

		it('TestingModule should be defined', async () => {
			expect(module).toBeDefined()
		})

		it('NestLoggerBundle should be defined', async () => {
			expect(loggerBundle).toBeDefined()
		})
	})
})

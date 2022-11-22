import { DynamicModule, ForwardReference, Type } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { Test, TestingModuleBuilder } from '@nestjs/testing'

import pino from 'pino'

type ModuleType = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference

export class TestUtils {

	/**
	 * Create a configured test module
	 */
	static async createTestingModule(importModules: ModuleType[], overrideProviders: [any, any][] = []) {
		const builder: TestingModuleBuilder = Test.createTestingModule({
			providers: [],
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
				}),
                ...importModules
			],
		})

		for (const overrideProvider of overrideProviders) {
			builder.overrideProvider(overrideProvider[0]).useClass(overrideProvider[1])
		}
        
		return await builder.compile()
	}
}

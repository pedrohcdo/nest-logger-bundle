import { DynamicModule, ForwardReference, Type } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModuleBuilder } from '@nestjs/testing';

type ModuleType = Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference;

export class TestUtils {
	/**
	 * Create a configured test module
	 */
	static async createTestingModule(
		importModules: ModuleType[],
		overrideProviders: [any, any][] = [],
		mockers: [string | symbol, any][] = []
	) {
		const builder: TestingModuleBuilder = Test.createTestingModule({
			providers: [],
			imports: [
				ConfigModule.forRoot({
					isGlobal: true,
				}),
				...importModules,
			],
		});

		for (const overrideProvider of overrideProviders) {
			builder.overrideProvider(overrideProvider[0]).useClass(overrideProvider[1]);
		}

		builder.useMocker(token => {
			for (let mocker of mockers) {
				if (token === mocker[0]) {
					return mocker[1];
				}
			}
		});

		return await builder.compile();
	}
}

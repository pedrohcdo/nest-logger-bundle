import { Test, TestingModule } from '@nestjs/testing'
import { TestUtils } from 'test-utils';
import { NestLoggerModule } from './nest-logger.module'


describe('AppController', () => {

	let module: TestingModule;

	beforeEach(async () => {
		// Pra realizar o teste do "SimpleAppController" é necessario que o nest crie a arvore de dependencia do "SimpleAppModule".
		// O metodo utilitario abaixo cria o modulo de teste utilizando como raiz o "SimpleAppModule".
		module = await TestUtils.createTestingModule([NestLoggerModule])
	})

	describe('creating NestLoggerModule', () => {

		it('should be defined', async () => {
			expect(module).toBeDefined()
		})
	})
})

import { Test, TestingModule } from '@nestjs/testing'
import { TestUtils } from '../../utils/test-utils'
import { SampleController } from './sample.controller'
import { SampleModule } from '../sample.module'

describe('AppController', () => {
	let appController: SampleController

	beforeEach(async () => {
		// Pra realizar o teste do "SimpleAppController" é necessario que o nest crie a arvore de dependencia do "SimpleAppModule".
		// O metodo utilitario abaixo cria o modulo de teste utilizando como raiz o "SimpleAppModule".
		const module: TestingModule = await TestUtils.createMockedModule(SampleModule)
		//
		appController = module.get<SampleController>(SampleController)
	})

	describe('root', () => {
		it('should return "Hello World!"', async () => {
			expect(await appController.logSample('test')).toBe('test')
		})
	})
})

import { ConfigurableModuleBuilder } from '@nestjs/common'
import { LoggerBundleParams } from './nest-logger.params'

interface ConfigurableModuleExtras {

	isGlobal?: boolean
}

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<LoggerBundleParams>()
	.setClassMethodName('forRoot')
	.setExtras(
		{} as ConfigurableModuleExtras,
		(definition, extras) => {
			return {
				...definition,
				global: extras.isGlobal,
			}
		}
	)
	.build()

export { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN }

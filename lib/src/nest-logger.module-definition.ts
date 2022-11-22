import { ConfigurableModuleBuilder } from '@nestjs/common'
import { NestLoggerParams } from './nest-logger.params'

const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } = new ConfigurableModuleBuilder<NestLoggerParams>()
	.setClassMethodName('forRoot')
	.setExtras(
		{
			isGlobal: true,
		},
		(definition, extras) => {
			return {
				...definition,
				global: extras.isGlobal,
			}
		}
	)
	.build()

export { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN }

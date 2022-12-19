import { Controller, Get, Param } from '@nestjs/common'
import { ApiParam, ApiTags } from '@nestjs/swagger'
import { SampleService } from '../service/sample.service'

@ApiTags('Sample')
@Controller('sample')
export class SampleController {

	constructor(private readonly sampleService: SampleService) {}

	@Get('create-user/:email/:username')
	@ApiParam({ name: 'email', example: 'teste@teste.com' })
	@ApiParam({ name: 'username', example: 'Teste 123' })
	logSample(@Param('email') email: string, @Param('username') username: string) {
		return this.sampleService.logSample(email, username);
	}
}

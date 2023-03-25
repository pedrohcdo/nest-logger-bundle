import { Body, Controller, Post, Param, UsePipes, ValidationPipe } from '@nestjs/common'
import { ApiBody, ApiParam, ApiTags } from '@nestjs/swagger'
import { SampleDto } from '../dto/sample.dto';
import { SampleService } from '../service/sample.service'

@ApiTags('Sample')
@Controller('sample')
@UsePipes(new ValidationPipe({ transform: true }))
export class SampleController {

	constructor(private readonly sampleService: SampleService) {}

	@Post('create-user/:email/:username')
	@ApiParam({ name: 'email', example: 'teste@teste.com' })
	@ApiParam({ name: 'username', example: 'Teste 123' })
	@ApiBody({ type: SampleDto })
	logSample(@Param('email') email: string, @Param('username') username: string, @Body() body: SampleDto) {
		return this.sampleService.logSample(email, username);
	}
}

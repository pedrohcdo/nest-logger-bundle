import { Injectable } from '@nestjs/common'
import { NestLoggerService } from '@pedrohcd/nest-logger';
@Injectable()
export class SampleService {

	constructor(private logService: NestLoggerService) {
		this.logService.setContextToken("SampleService")
	}

	async logSample(valueToLog: string): Promise<string> {

		this.logService.putTag("exemplo1", "123");

		this.logService.enter("A");
		
		this.logService.putTag("exemplo2", "123");

		this.logService.log(valueToLog)
		this.logService.exit();
		
		return valueToLog
	}
}

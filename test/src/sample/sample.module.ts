import { Module } from '@nestjs/common';
import { SampleController } from './controller/sample.controller';
import { SampleService } from './service/sample.service';

@Module({
	imports: [],
	controllers: [SampleController],
	providers: [SampleService],
})
export class SampleModule {}

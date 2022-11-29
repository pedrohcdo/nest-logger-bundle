import { Module } from '@nestjs/common'
import { GlobalModule } from './core/global.module'
import { SampleModule } from './sample/sample.module'

@Module({
	imports: [GlobalModule, SampleModule],
	controllers: [],
	providers: [],
})
export class AppModule {}

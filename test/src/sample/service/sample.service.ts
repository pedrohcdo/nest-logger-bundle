import { Injectable } from '@nestjs/common'
import { LoggerBundleService } from 'nest-logger-bundle';

@Injectable()
export class SampleService {

	constructor(
	  private logService: LoggerBundleService
	) {
	  this.logService.setContextToken(SampleService.name)
	}
  
	private async findUserByEmail(email: string){
	  this.logService.enter('finding user by email ')
	  this.logService.log('finding...')
	  // ....
	  this.logService.exit()
  
	  return null;
	}
  
	private async saveUser(email: string, username: string){
	  this.logService.enter('creating user')
  
	  this.logService.log(`checking if the user with email '${email}' already exists...`)
	  const user = await this.findUserByEmail(email);
  
	  if(!user) {
		// create user ....
		this.logService.log('user created %s %s', email, username)
	  } else {
		this.logService.log('A user with that email already exists')
	  }

	  // ...
	  this.logService.exit()
  
	  return {}
	}
  
	async logSample(email: string, username: string){
	  this.logService.log('log example')
	  this.logService.putTag("test", "test 123")
	  await this.saveUser(email, username);
	}
  }
  
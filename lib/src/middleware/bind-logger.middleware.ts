import { Injectable, NestMiddleware } from '@nestjs/common';
import { NextFunction, Request, Response } from 'express';

@Injectable()
export class BindLoggerMiddleware implements NestMiddleware {
	constructor() {}

	//
	use(request: Request, _: Response, next: NextFunction) {}
}

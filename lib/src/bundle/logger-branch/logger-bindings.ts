export interface LoggerBindingsContext {
	method?: string;
	path?: string;
	duration?: number;
	ip?: string;
	response?: {
		statusCode: number;
		headers: any;
		data?: any;
	};
}

export interface LoggerBindings {
	tgContext: LoggerBindingsContext;

	tgTags: {
		[key: string]: string;
	};
}
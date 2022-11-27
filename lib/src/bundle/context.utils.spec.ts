import { NestLoggerUtils } from './context.utils';

describe('ContextUtils', () => {
	describe('parsing Logger Params to Object', () => {
		it('should format message', async () => {
			const parsed = NestLoggerUtils.parseLoggedParamsToObject(['test %d %d', 10, 10]);
			expect(parsed).toEqual({
				message: 'test 10 10',
			});
		});

		it('should format message in object', async () => {
			const parsed = NestLoggerUtils.parseLoggedParamsToObject([{ teste: 10 }, 'test %d %d', 10, 10]);
			expect(parsed).toEqual({
				message: 'test 10 10',
				teste: 10,
			});
		});

		it('should format message in error', async () => {
			const error = new Error('test');
			const parsed = NestLoggerUtils.parseLoggedParamsToObject([error, 'test %d %d', 10, 10]);
			expect(parsed).toEqual({
				error: error,
				message: 'test 10 10',
			});
		});
	});
});

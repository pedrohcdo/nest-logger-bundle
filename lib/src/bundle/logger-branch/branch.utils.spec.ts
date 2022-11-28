import { LoggerBranchUtils } from './branch.utils';

describe('LoggerBranchUtils', () => {
	describe('parsing Logger Params to Object', () => {
		it('should format message', async () => {
			const parsed = LoggerBranchUtils.parseLoggedParamsToObject(['test %d %d', 10, 10]);
			expect(parsed).toEqual({
				message: 'test 10 10',
			});
		});

		it('should format message in object', async () => {
			const parsed = LoggerBranchUtils.parseLoggedParamsToObject([{ teste: 10 }, 'test %d %d', 10, 10]);
			expect(parsed).toEqual({
				message: 'test 10 10',
				teste: 10,
			});
		});

		it('should format message in error', async () => {
			const error = new Error('test');
			const parsed = LoggerBranchUtils.parseLoggedParamsToObject([error, 'test %d %d', 10, 10]);
			expect(parsed).toEqual({
				error: error,
				message: 'test 10 10',
			});
		});
	});
});

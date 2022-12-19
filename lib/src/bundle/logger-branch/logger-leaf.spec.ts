import { LoggerBundleLevelStrategy } from "../../nest-logger.params";
import { LoggerLeaf } from "./logger-leaf";

describe('LoggerLeaf', () => {

    let loggerLeaf: LoggerLeaf;
    
    beforeEach(() => {
        loggerLeaf = new LoggerLeaf('info', ['test %d', 10]);
    })

    describe('introspecting leaf', () => {

        it('should be info', async () => {
            expect(loggerLeaf.introspectLevel(LoggerBundleLevelStrategy.MINOR_LEVEL)).toEqual('info')
            expect(loggerLeaf.introspectLevel(LoggerBundleLevelStrategy.MAJOR_LEVEL)).toEqual('info')
            expect(loggerLeaf.introspectLevel(LoggerBundleLevelStrategy.LAST_LEVEL)).toEqual('info')
		});
    })

	describe('convert to object', () => {

		it('should be a valid object', async () => {
			
            expect(loggerLeaf.toObject()).toEqual({
                level: 'info',
                message: 'test 10'
            })
		});
	});

    describe('cloning', () => {

		it('the leaf should be clone correcltly', async () => {
            expect(loggerLeaf.clone()).toBeDefined();
		});
	});
});
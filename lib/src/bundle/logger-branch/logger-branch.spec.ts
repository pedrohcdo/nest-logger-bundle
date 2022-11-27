import { NestLoggerLevelStrategy } from "../../nest-logger.params";
import { LoggerBranch } from "./logger-branch";

describe('LoggerBranch', () => {

    let loggerBranch: LoggerBranch;
    
    beforeEach(() => {
        loggerBranch = new LoggerBranch(null, 'root');
    })

    describe('logging', () => {

		it('should log an string on all levels', async () => {
			loggerBranch.log('debug', 'ola %d', 10);
            loggerBranch.log('error', 'ola %d', 10);
            loggerBranch.log('fatal', 'ola %d', 10);
            loggerBranch.log('info', 'ola %d', 10);
            loggerBranch.log('trace', 'ola %d', 10);
            loggerBranch.log('warn', 'ola %d', 10);
            expect(loggerBranch.toObject()).toMatchObject({
                name: 'root',
                logs: [
                    {
                        level: "debug",
                        message: "ola 10",
                    },
                    {
                        level: "error",
                        message: "ola 10",
                    },
                    {
                        level: "fatal",
                        message: "ola 10",
                    },                    {
                        level: "info",
                        message: "ola 10",
                    },
                    {
                        level: "trace",
                        message: "ola 10",
                    },
                    {
                        level: "warn",
                        message: "ola 10",
                    }
                ]
            });
		});

        it('should log an object on all levels', async () => {
			loggerBranch.log('debug', {test: 10}, 'ola %d', 10);
            loggerBranch.log('error', {test: 10}, 'ola %d', 10);
            loggerBranch.log('fatal', {test: 10}, 'ola %d', 10);
            loggerBranch.log('info', {test: 10}, 'ola %d', 10);
            loggerBranch.log('trace', {test: 10}, 'ola %d', 10);
            loggerBranch.log('warn', {test: 10}, 'ola %d', 10);
            expect(loggerBranch.toObject()).toMatchObject({
                name: 'root',
                logs: [
                    {
                        level: "debug",
                        message: "ola 10",
                        test: 10
                    },
                    {
                        level: "error",
                        message: "ola 10",
                        test: 10
                    },
                    {
                        level: "fatal",
                        message: "ola 10",
                        test: 10
                    },
                    {
                        level: "info",
                        message: "ola 10",
                        test: 10
                    },
                    {
                        level: "trace",
                        message: "ola 10",
                        test: 10
                    },
                    {
                        level: "warn",
                        message: "ola 10",
                        test: 10
                    }
                ]
            });
		});

        it('should log an error on all levels', async () => {
            const error = new Error('test');
			loggerBranch.log('debug', error, 'ola %d', 10);
            loggerBranch.log('error', error, 'ola %d', 10);
            loggerBranch.log('fatal', error, 'ola %d', 10);
            loggerBranch.log('info', error, 'ola %d', 10);
            loggerBranch.log('trace', error, 'ola %d', 10);
            loggerBranch.log('warn', error, 'ola %d', 10);
            expect(loggerBranch.toObject()).toMatchObject({
                name: 'root',
                logs: [
                    {
                        level: "debug",
                        message: "ola 10",
                        error: error
                    },
                    {
                        level: "error",
                        message: "ola 10",
                        error: error
                    },
                    {
                        level: "fatal",
                        message: "ola 10",
                        error: error
                    },
                    {
                        level: "info",
                        message: "ola 10",
                        error: error
                    },
                    {
                        level: "trace",
                        message: "ola 10",
                        error: error
                    },
                    {
                        level: "warn",
                        message: "ola 10",
                        error: error
                    }
                ]
            });
		});
    })

    describe('introspecting branch', () => {

        it('should enter on a child branch', async () => {
			const child1 = loggerBranch.enter('test 1');
            child1.log('trace', 'a');

            //
            const child2 = child1.enter('test 2')
            child2.log('trace', 'b')
            child2.log('debug', 'c')
            child2.exit()

            //
            child1.log('fatal', 'd')
            child1.log('info', 'e')
            child1.exit();

            //
            loggerBranch.log('warn', 'f');

            //
            expect(loggerBranch.introspectLevel(NestLoggerLevelStrategy.MINOR_LEVEL)).toEqual('trace')
            expect(loggerBranch.introspectLevel(NestLoggerLevelStrategy.MAJOR_LEVEL)).toEqual('fatal')
            expect(loggerBranch.introspectLevel(NestLoggerLevelStrategy.LAST_LEVEL)).toEqual('warn')
		});
    })

	describe('entering/ exiting branch', () => {

		it('should enter on a child branch', async () => {
			const child = loggerBranch.enter('test');
            expect(loggerBranch.branchs.length).toBe(1);
            expect(loggerBranch.branchs[0].toObject()).toMatchObject({
                name: 'test',
                logs: []
            });
            expect(child.exitedAt).toBeNull()
		});

        it('should exit', async () => {
            loggerBranch.exit();
            expect(loggerBranch.exitedAt).toBeDefined()
		});

        it('should enter, log in the child branch and exit', async () => {
			const child = loggerBranch.enter('test');
            child.log('debug', 'test');
            child.exit();
            expect(loggerBranch.branchs.length).toBe(1);
            expect(child.exitedAt).toBeDefined()
            expect(child.toObject()).toMatchObject({
                name: 'test',
                logs: [
                    {
                        "level": "debug",
                        "message": "test",
                    }
                ]
            });
            expect(loggerBranch.toObject()).toMatchObject({
                name: 'root',
                logs: [
                    {
                        logs:  [
                            {
                                level: "debug",
                                message: "test",
                            },
                        ],
                        name: "test"
                    }
                ]
            });
		});
        
	});

    describe('cloning', () => {

		it('the leaf should be clone correcltly', async () => {
            const clonedBranch = loggerBranch.clone() as LoggerBranch;

            expect(clonedBranch).toBeDefined();

            clonedBranch.branchs = null;

            expect(loggerBranch.branchs).toBeDefined();
		});
	});
});
const assert = require('assert');
const winston = require('winston')
const WinstonSentry = require('../sentry-transport')

const Sentry = new WinstonSentry({
    dsn: process.env.DSN,
    tags: {
        baz: 'bar',
        ham: 'eggs',
        hoge: 'piyo'
    },
    extra: {
        user: {
            id: 'xyz'
        }
    },
    context: {
        toto: 'tata'
    }
})

const logger = winston.createLogger({
    level: 'debug',
    format: winston.format.json(),
    defaultMeta: { service: 'test-service' },
    transports: [
        Sentry
    ]
});

describe('Create an error exception and send it to Sentry', function () {

    logger.error('test generic error ')


})

describe('Create an error exception with extra data and send it to Sentry', function () {

    logger.error('test error from user foo ', { user: { id: 'foo' } })
    logger.error('test error from user bar ', { user: { id: 'bar' } })

    logger.error('test error from user email ', { user: { email: 'foo@bar.baz', id: 1234 }, tags: { 'foo': 'bar' } })

    logger.error('test error with request fingerprint', {
        user: {
            id: 1
        },
        request: {
            path: '/foo/bar',
            method: 'GET'
        }
    })

    logger.error('test error with same request  fingerprint ', {
        user: {
            id: 2
        },
        request: {
            path: '/foo/bar',
            method: 'GET'
        }
    })

    logger.error('test error with same request  fingerprint and extra data ', {
        user: {
            id: 2
        },
        request: {
            path: '/foo/bar',
            method: 'GET'
        },
        tags: {
            foo: 'bar'
        },
        overwatch: {
            best: 'game'
        }
    })


})

describe('Create a silly message and send it to Sentry', function () {
    logger.silly('this is a silly message')

})

describe('Create a warning message and send it to Sentry', function () {
    logger.warn('this is a warning message')

})

describe('Create a debug message and send it to Sentry', function () {
    logger.debug('this is a debug message')

})

describe('Create an info message and send it to Sentry', function () {
    logger.info('this is an info message')

})





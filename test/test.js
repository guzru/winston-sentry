const assert = require('assert');
const winston = require('winston')
const WinstonSentry = require('../sentry-transport')

const Sentry = new WinstonSentry({
    dsn: process.env.DSN
})

const logger = winston.createLogger({
    level: 'silly',
    format: winston.format.json(),
    defaultMeta: { service: 'test-service' },
    transports: [
        Sentry
    ]
});

describe('Create an error exception and send it to Sentry', function () {

    logger.error('test generic error ')


})

describe('Create an error exception with user data and send it to Sentry', function () {

    logger.error('test error from user foo ', { user: { id: 'foo' } })
    logger.error('test error from user bar ', { user: { id: 'bar' } })


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





winston-sentry
==============

Winston logging transport for [Sentry](https://getsentry.com).

### Usage:

```javascript
var winston = require('winston'),
var SentryLogger = require('winston-sentry');

var sentryTransport = new SentryLogger({
  dsn: 'SENTRY_DSN_URL', // sentry endpoint url
  level: 'warn', // log level to capture, default: debug
  logger: 'my-logger-name', // logger name, default: root
  patchGlobal: true // capture all uncaught errors, default: false
});

var logger = new winston.Logger({
  transports: [
    new winston.transports.Console({level: 'silly'}),
    sentryTransport
  ]
});
```

Winston logging levels are mapped to the default sentry levels:

  - info
  - error
  - debug
  - warning

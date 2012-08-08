winston-sentry
==============

Sentry transport for winston logger for node js
-----------------------------------------------

Follow this sample configuration to use:

```javascript
var winston = require('winston'),
    Mail = require('winston-mail').Mail,
    Sentry = require('winston-sentry');

var logger = new winston.Logger({
    transports: [
        new winston.transports.Console({level: 'silly'}),
        new Sentry({
                level: 'warn',
                dsn: "{{ YOUR SENTRY DSN }}"
        })
    ],
});
```

If you want to use patchGlobal to catch all uncaught errors, simply pass it as option like this:

```javascript
new Sentry({
    patchGlobal: true
});
```
    
Winston logging levels are mapped to the default sentry levels like this:

    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error',
    
New with version 0.0.3!
-----------------------

 * when logging as `error` level, it will implicitly call raven's `captureError` which will also capture the stack trace.
 * the `winston.Logger` object exposes the sentry client as `sentry_client`. Usage is simple:

```javascript
logger = new winston.Logger(...);
logger.sentry_client.captureQuery("SELECT * FROM users;");
```
    
** TODO:

 * capture sentry identifiers?
    

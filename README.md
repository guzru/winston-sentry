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
            dsn: "{{ YOUR SENTRY DSN }}",
            tags: { key: 'value' },
            extra: { key: 'value' }
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

```javascript
{
    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error'
}
```

You can customize how log levels are mapped using the `levelsMap` option:

```javascript
new Sentry({
    levelsMap: {
        verbose: 'info'
    }
});
```

Changelog
---------

**0.2.1**
* Changelog updated. No code changes.

**0.2.0**
* Upgrade Raven client to version 1.1.x

**0.1.5**
* Added license file. No code changes.

**0.1.4**
* Bug fix: Level in log function should not fallback to the level filtering configuration

**0.1.3**
* Fixes #30: Transport should not ignore configured log level

**0.1.2**
* Upgrade Raven client to version 0.11.0
* Refactoring global tags support to better work with the new client
* Refactoring default options 

**0.1.1**
* Added support for global tags that will be added to every message sent to sentry

**0.1.0**
* Upgrade Raven client to version 0.8.1

**0.0.6**

* Error stack traces will be sent to sentry. See [#3](https://github.com/guzru/winston-sentry/issues/3) for more details.
* Upgrade raven to latest version (0.6.3)
* Raven client can be passed to the transport from the outside

**0.0.5**

 * Winston metadata will be populated into the "Additional Data" section in Sentry.
 * If metadata contains a `tags` property, any key/value pairs within that property will be populated as Sentry tags.
   *It will be removed from the "Additional Data" section to avoid data duplication.* This will allow Winston metadata
   to be filterable within the Sentry UI.

```javascript

logger = new winston.Logger(...);
logger.log("info", "my log message", {
      userInformation: {
         os: "linux",
         browser: "chrome",
         userAgent: "<user agent string>"
      }
      tags: {
         productVersion: "1.2"
      }
   }
});

// In Sentry, the "Additional Data" section would show:
// - userInformation
//      - os: linux
//      - browser: chrome
//      - userAgent: <user agent string>
//
// The tags would show:
// - level: info
// - logger: [logger property from transport constructor - defaults to "root"]
// - server_name: [machine name]
// - productVersion: 1.2
```

**0.0.4**

 * Added support for capturing "Additional Data".

**0.0.3**

```javascript
logger = new winston.Logger(...);
logger.sentry_client.captureQuery("SELECT * FROM users;");
```

 * when logging as `error` level, it will implicitly call raven's `captureError` which will also capture the stack trace.
 * the `winston.Logger` object exposes the sentry client as `sentry_client`. Usage is simple:


** TODO:

 * capture sentry identifiers?
    

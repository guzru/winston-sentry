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
    
Changelog
---------

**0.0.5**

 * Winston metadata will be populated into the "Additional Data" section in Sentry.
 * If metadata contains a `tags` property, any key/value pairs within that property will be populated as Sentry tags.
   *it will be removed from the "Additional Data" section to avoid data duplication.* This will allow Winston metadata
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
    

let util = require('util'),
  winston = require('winston'),
  _ = require('lodash');

const Sentry = require('@sentry/node');

let onError = function (error) {
  var message = "Cannot talk to sentry.";
  if (error && error.reason) {
    message += " Reason: " + error.reason;
  }
  console.log(message);
}

let SentryTransport = winston.transports.Sentry = function (options) {
  winston.Transport.call(this, _.pick(options, "level"));

  // Default options
  this.defaults = {
    dsn: '',
    logger: 'root',
    levelsMap: {
      silly: 'debug',
      verbose: 'debug',
      info: 'info',
      debug: 'debug',
      warn: 'warning',
      error: 'error'
    },
    environment: process.env.NODE_ENV,
    tags: {},
    context: {},
    user: {},
    extra: {}
  }

  // For backward compatibility with deprecated `globalTags` option
  options.tags = options.tags || options.globalTags;

  if (options.extra) {
    options.user = options.user || options.extra.user
    if (options.extra.user) {
      delete options.extra.user
    }

    options.context = options.context || options.extra.context

    if (options.extra.context) {
      delete options.extra.context
    }

  }






  this.options = _.defaultsDeep(options, this.defaults);


  Sentry.init(this.options);


  Sentry.configureScope((scope) => {

    if (this.options.context) {
      scope.setContext(this.options.context)
    }

    if (this.options.extra) {
      for (let prop in this.options.extra) {
        scope.setExtra(prop, this.options.extra[prop]);
      }
      delete this.options.extra
    }


    if (this.options.tags) {

      scope.setTags(this.options.tags);

      delete this.options.tags
    }

    if (this.options.user) {
      scope.setUser(this.options.user)
    }
  })

};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(SentryTransport, winston.Transport);

//
// Expose the name of this Transport on the prototype
SentryTransport.prototype.name = 'sentry';
//


SentryTransport.prototype.log = function (oldLevel, msg, meta, callback) {
  const level = this.options.levelsMap[oldLevel];

  meta = meta || {};

  let extraData = _.extend({}, meta),
    tags = extraData.tags;
  delete extraData.tags;

  let extra = {
    'level': level,
    'extra': extraData,
    'tags': tags
  };

  if (extraData.request) {
    extra.request = extraData.request;
    delete extraData.request;
  }

  if (extraData.user) {
    extra.user = extraData.user;
    delete extraData.user;
  }

  try {


    if (level == 'error') {

      // Support exceptions logging
      if (meta instanceof Error) {
        if (msg == '') {
          msg = meta;
        } else {
          meta.message = msg + ". cause: " + meta.message;
          msg = meta;
        }
      } else {
        if (!(msg instanceof Error)) {
          msg = new Error(msg)
        }
      }

      Sentry.withScope(scope => {

        if (extra.extra) {
          for (let prop in extra.extra) {
            scope.setExtra(prop, extra.extra[prop]);
          }
          delete extra.extra
        }

        if (extra.tags) {

          for (let prop in extra.tags) {
            scope.setTag(prop, extra.tags[prop]);
          }

          delete extra.tags

        }

        if (extra.user) {
          scope.setUser(extra.user);
          delete extra.user
        }

        if (extra.level) {
          scope.setLevel(extra.level);
        }

        if (extra.request) {
          const httpRequest = extra.request
          const method = httpRequest.method
          const path = httpRequest.path
          scope.setFingerprint([method, path]);
        }

        Sentry.captureException(msg, function (err, res) {
          if (err) {
            onError(err)
          }
          callback(null, true);

        });


      });


    } else {

      Sentry.withScope(scope => {

        if (extra.extra) {
          for (let prop in extra.extra) {
            scope.setExtra(prop, extra.extra[prop]);
          }
          delete extra.extra
        }

        if (extra.tags) {

          for (let prop in extra.tags) {
            scope.setTag(prop, extra.tags[prop]);
          }

          delete extra.tags

        }

        if (extra.user) {
          scope.setUser(extra.user);
          delete extra.user
        }

        if (extra.level) {
          scope.setLevel(extra.level);
        }

        Sentry.captureMessage(msg, function (err, res) {
          if (err) {
            onError(err)
          }

          callback(null, true);
        });

      });
    }


  } catch (err) {
    console.error(err);
  }
};

module.exports = SentryTransport;

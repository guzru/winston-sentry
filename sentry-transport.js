var util = require('util'),
    Raven = require('raven'),
    winston = require('winston'),
    _ = require('lodash');

var Sentry = winston.transports.Sentry = function (options) {
  winston.Transport.call(this, _.pick(options, "level"));

  // Default options
  this.defaults = {
    dsn: '',
    patchGlobal: false,
    logger: 'root',
    levelsMap: {
      silly: 'debug',
      verbose: 'debug',
      info: 'info',
      debug: 'debug',
      warn: 'warning',
      error: 'error'
    },
    tags: {},
    extra: {}
  }

  // For backward compatibility with deprecated `globalTags` option
  options.tags = options.tags || options.globalTags;

  this.options = _.defaultsDeep(options, this.defaults);

  Raven.config(this.options.dsn, this.options);

  if (this.options.patchGlobal) {
    Raven.install();
  }

  // Handle errors
  Raven.on('error', function(error) {
    var message = "Cannot talk to sentry.";
    if (error && error.reason) {
        message += " Reason: " + error.reason;
    }
    console.log(message);
  });
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(Sentry, winston.Transport);

//
// Expose the name of this Transport on the prototype
Sentry.prototype.name = 'sentry';
//

Sentry.prototype.log = function (level, msg, meta, callback) {
  level = this.options.levelsMap[level];
  meta = meta || {};

  var extraData = _.extend({}, meta),
      tags = extraData.tags;
  delete extraData.tags;

  var extra = {
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
      }

      Raven.captureException(msg, extra, function() {
        callback(null, true);
      });
    } else {
      Raven.captureMessage(msg, extra, function() {
        callback(null, true);
      });
    }
  } catch(err) {
    console.error(err);
  }
};

module.exports = Sentry;

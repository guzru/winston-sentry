var util = require('util'),
    raven = require('raven'),
    winston = require('winston'),
    _ = require('underscore');

var Sentry = winston.transports.Sentry = function (options) {

  this._dsn = options.dsn || '';
  this._globalTags = options.globalTags || {};
  this.patchGlobal = options.patchGlobal || false;
  this.level = options.level || 'info';
  
  delete options.dsn;
  delete options.globalTags;
  delete options.patchGlobal;
  delete options.level;
  
  options.logger = options.logger || 'root';
  
  this._sentry = options.raven || new raven.Client(this._dsn, options);

  if(this.patchGlobal) {
    this._sentry.patchGlobal();
  }

  this._levels_map = options.levels_map || {
    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error'
  }

  // Handle errors
  this._sentry.on('error', function(error) {
    var message = "Cannot talk to sentry.";
    if(error && error.reason) {
        message += " Reason: " + error.reason;
    }
    console.log(message);
  });

  // Expose sentry client to winston.Logger
  winston.Logger.prototype.sentry_client = this._sentry;
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
  // TODO: handle this better
  level = this._levels_map[level] || this.level;
  meta = meta || {};

  var extraData = _.extend({}, meta),
      tags = _.extend({}, this._globalTags, extraData.tags);
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
    if(level == 'error') {
      // Support exceptions logging
      if (meta instanceof Error) {
        if (msg == '') {
          msg = meta;
        } else {
          meta.message = msg + ". cause: " + meta.message;
          msg = meta;
        }
      }

      this._sentry.captureError(msg, extra, function() {
        callback(null, true);
      });
    } else {
      this._sentry.captureMessage(msg, extra, function() {
        callback(null, true);
      });
    }
  } catch(err) {
    console.error(err);
  }
};

module.exports = Sentry;

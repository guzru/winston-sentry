var util = require('util'),
  raven = require('raven'),
  winston = require('winston')
_ = require('underscore');

var Sentry = winston.transports.CustomerLogger = function (options) {

  this.name = 'Sentry';
  this._dsn = options.dsn || '';
  this.patchGlobal = options.patchGlobal || false;
  this._sentry = new raven.Client(this._dsn, {logger: options.logger || 'root'});

  if(this.patchGlobal) {
    this._sentry.patchGlobal();
  }

  this._levels_map = {
    silly: 'debug',
    verbose: 'debug',
    info: 'info',
    debug: 'debug',
    warn: 'warning',
    error: 'error'
  }

  // Set the level from your options
  this.level = options.level || 'info';

  // Handle errors
  this._sentry.on('error', function(err) {
    console.error("Sentry error: " + err);
  });

  // Expose sentry client to winston.Logger
  winston.Logger.prototype.sentry_client = this._sentry;
};

//
// Inherit from `winston.Transport` so you can take advantage
// of the base functionality and `.handleExceptions()`.
//
util.inherits(Sentry, winston.Transport);

Sentry.prototype.log = function (level, msg, meta, callback, error) {
  // TODO: handle this better
  level = this._levels_map[level] || this.level;

  meta = {
    'extra': meta || undefined,
    'level': level
  }

  try {
    if(level == 'error') {
      // Support exceptions logging
      if (error) {
        if (msg) {
          error.message = msg + ', cause: ' + error.message
        }
        msg = error;
      }

      this._sentry.captureError(msg, meta, function() {
        callback(null, true);
      });
    } else {
      this._sentry.captureMessage(msg, meta, function() {
        callback(null, true);
      });
    }
  } catch(err) {
    console.error(err);
  }
};

module.exports = Sentry;

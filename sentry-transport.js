/*jshint node:true*/
'use strict';

var Raven = require('raven').Client;
var winston = require('winston');
var util = require('util');
var _ = require('lodash');

var WHITELIST_OPTS = [
  'patchGlobal',
  'logger',
  'client',
  'level',
  'dsn'
];

var LEVELS_MAP = {
  'info': 'info',
  'error': 'error',
  'debug': 'debug',
  'warn': 'warning'
};

var SentryLogger = winston.transports.SentryLogger = function(opts) {
  _.extend(this, _.pick(opts, WHITELIST_OPTS));

  this.name = 'Sentry';
  this.logger = this.logger || 'root';
  this.level = this.level || 'debug';
  this.patchGlobal = !!this.patchGlobal;

  // Initialize a client if one is not provided
  this._initializeSentry();
};

// Inherit all default winston transport options/methods
util.inherits(SentryLogger, winston.Transport);

// Initialize a sentry client for logger
SentryLogger.prototype._initializeSentry = function() {
  if (this.sentry) {
    return;
  }
  if (!_.isString(this.dsn)) {
    throw new Error('SentryLogger requires `dsn` to initialize client');
  }

  // Create new raven client for logger
  this.sentry = new Raven(this.dsn);
  this.sentry.on('error', errorHandler);

  // Capture all uncaught exceptions
  if (this.patchGlobal) {
    this.sentry.patchGlobal();
  }

  // Basic error logger
  function errorHandler(err) {
    if (err.statusCode === 429) {
      console.warn('Sentry could not log due to rate limiting');
    } else if (err.reason) {
      console.error('Sentry encountered an error:', err.reason, err.statusCode);
    } else {
      console.error('Sentry encountered an unknown error');
    }
  }
};

// Custom log method for Sentry, maps levels and normalizes metaData
SentryLogger.prototype.log = function(level, msg, metaData, cb) {
  cb = cb || function(){};
  metaData = metaData || {};
  level = LEVELS_MAP[level] || this.level;

  var isError = level === 'error';
  var sentryMethod = isError? 'captureError' : 'captureMessage';

  var opts = {
    level: level,
    logger: this.logger
  };

  // Tags optional, found on metaData
  var tags = metaData && metaData.tags;
  if (tags) {
    opts.tags = tags;
  }

  // Meta data is optional, omit tags
  var meta = _.omit(metaData, 'tags');
  if (_.keys(meta).length > 0) {
    opts.meta = meta;
  }

  // Verify that the sentryMethod is available
  if (!this.sentry || !_.isFunction(this.sentry[sentryMethod])) {
    cb(new Error('Sentry log method unavailable'));
  }

  // Log the actual message to sentry
  this.sentry[sentryMethod](msg, opts, function(result) {
    // Global error handling is in place
    cb(null, result);
  });
};

module.exports = SentryLogger;

var _ = require('underscore');
var log = require('../logger');
var warnings = require('../warnings');
var RESERVED_FUNCTIONS = ['getState'];
var REQUIRED_FUNCTIONS = ['getInitialState'];

function validateStore(Store) {
  var missingFunctions = [];
  var displayName = Store.displayName;

  _.each(RESERVED_FUNCTIONS, function (functionName) {
    if (Store.prototype[functionName]) {
      if (displayName) {
        functionName += ' in ' + displayName;
      }


      if (warnings.reservedFunction) {
        log.warn(
          'Warning:', functionName,
          'is reserved for use by Marty. Please use a different name'
        );
      }
    }
  });

  _.each(REQUIRED_FUNCTIONS, function (functionName) {
    if (!Store.prototype[functionName]) {
      missingFunctions.push(functionName);
    }
  });

  if (missingFunctions.length) {
    var error = 'You must implement ' + missingFunctions.join(',');

    if (displayName) {
      error += ' in ' + displayName;
    }

    throw new Error(error);
  }
}

module.exports = validateStore;
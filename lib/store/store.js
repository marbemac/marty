var CHANGE_EVENT = 'changed';
var _ = require('underscore');
var log = require('../logger');
var uuid = require('../utils/uuid');
var fetchResult = require('../fetch');
var warnings = require('../warnings');
var Dispatcher = require('../dispatcher');
var Diagnostics = require('../diagnostics');
var StoreInstances = require('./storeInstances');
var CompoundError = require('../../errors/compound');
var NotFoundError = require('../../errors/notFound')
var StatusConstants = require('../../constants/status');
var ActionHandlerNotFoundError = require('../../errors/actionHandlerNotFound');
var ActionPredicateUndefinedError = require('../../errors/actionPredicateUndefined');

var RESERVED_FUNCTIONS = ['getState'];
var REQUIRED_FUNCTIONS = ['getInitialState'];
var PROTECTED_FUNCTIONS = ['clear', 'dispose'];


function getInstance(store) {
  return StoreInstances.get(store);
}

function createInstance(store, options) {
  return StoreInstances.createStoreInstance(store, options);
}

class Store {
  constructor(options) {
    this.__id = uuid.small();

    var instance = createInstance(this, options);
    var dispatcher = instance.dispatcher;

    this.replaceState(this.getInitialState());
    this.dispatchToken = dispatcher.register(
      _.bind(this.handleAction, this)
    );
  }

  get state() {
    return getInstance(this).state;
  }

  set state(newState) {
    this.replaceState(newState);
  }

  setState(state) {
    throw new Error('NOT TESTED');

    var newState = _.extend({}, this.state, state);

    this.replaceState(newState);
  }

  replaceState(newState) {
    var instance = getInstance(this);
    var currentState = instance.state;

    if (newState !== currentState) {
      instance.state = newState;
      this.hasChanged();
    }
  }

  handleAction() {
  }

  hasChanged(eventArgs) {
    var emitter = getInstance(this).emitter;

    emitter.emit.call(emitter, CHANGE_EVENT, this.state, this, eventArgs);
  }

  addChangeListener(callback, context) {
    var emitter = getInstance(this).emitter;

    if (context) {
      callback = _.bind(callback, context);
    }

    Diagnostics.trace(
      'The', this.displayName,
      'store (' + this.id + ') is adding a change listener'
    );

    emitter.on(CHANGE_EVENT, callback);

    return {
      dispose: () => {
        Diagnostics.trace(
          'The', this.displayName,
          'store (' + this.id + ') is disposing of a change listener'
        );

        emitter.removeListener(CHANGE_EVENT, callback);
      }
    };
  }
}

module.exports = Store;

// return;

// function Store(options) {
//   var store = {
//     __state: null,
//     __type: 'Store',
//     __id: uuid.small()
//   };

//   var defaultState = {};
//   var fetchHistory = {};
//   var failedFetches = {};
//   var fetchInProgress = {};
//   var emitter = new EventEmitter();
//   var dispatcher = options.dispatcher || Dispatcher.getDefault();

//   store.handlers = {};
//   store.clear = clear;
//   store.dispose = dispose;
//   store.waitFor = waitFor;
//   store.fetch = fetchState;
//   store.setState = setState;
//   store.getState = getState;
//   store.hasChanged = hasChanged;
//   store.handleAction = handleAction;
//   store.setInitialState = setInitialState;
//   store.hasAlreadyFetched = hasAlreadyFetched;
//   store.addChangeListener = addChangeListener;

//   store.fetch.done = fetchResult.done;
//   store.fetch.failed = fetchResult.failed;
//   store.fetch.pending = fetchResult.pending;
//   store.fetch.notFound = fetchResult.notFound;

//   emitter.setMaxListeners(options.maxListeners || Store.defaultMaxListeners);

//   validateOptions(options);
//   extendStore(store, _.omit(options, _.union(PROTECTED_FUNCTIONS, RESERVED_FUNCTIONS)));
//   validateHandlers(store);

//   store.dispatchToken = dispatcher.register(_.bind(store.handleAction, store));
//   store.__state = store.getInitialState();

//   if (_.isNull(store.__state) || _.isUndefined(store.__state)) {
//     store.__state = defaultState;
//   }

//   Object.defineProperty(store, 'state', {
//     get: function () {
//       return this.getState();
//     },
//     set: function (value) {
//       this.setState(value);
//     }
//   });

//   return store;


// function validateHandlers(store) {
//   _.each(store.handlers, function (actionPredicate, handlerName) {
//     var actionHandler = store[handlerName];

//     if (_.isUndefined(actionHandler) || _.isNull(actionHandler)) {
//       throw new ActionHandlerNotFoundError(handlerName, store);
//     }

//     if (!actionPredicate) {
//       throw new ActionPredicateUndefinedError(handlerName, store);
//     }
//   });
// }

//   function setInitialState(state) {
//     this.state = this.getInitialState(state);
//   }

//   function extendStore(store, options) {
//     var handlers = _.map(options.mixins, function (mixin) {
//       return mixin.handlers;
//     });

//     var mixins = _.map(options.mixins, function (mixin) {
//       return _.omit(mixin, 'handlers');
//     });

//     _.extend.apply(_, [store, options].concat(mixins));
//     _.extend.apply(_, [store.handlers].concat(handlers));
//   }

//   function dispose() {
//     emitter.removeAllListeners(CHANGE_EVENT);
//     this.clear();

//     if (_.isFunction(options.dispose)) {
//       options.dispose.call(this);
//     }

//     if (this.dispatchToken) {
//       dispatcher.unregister(this.dispatchToken);
//       this.dispatchToken = undefined;
//     }
//   }

//   function hasAlreadyFetched(fetchId) {
//     return !!fetchHistory[fetchId];
//   }

//   function fetchState(id, local, remote) {
//     var options, result, error, cacheError, context = this.__context;

//     if (_.isObject(id)) {
//       options = id;
//     } else {
//       options = {
//         id: id,
//         locally: local,
//         remotely: remote
//       };
//     }

//     _.defaults(options, {
//       locally: _.noop,
//       remotely: _.noop
//     });

//     if (!options || !options.id) {
//       throw new Error('must specify an id');
//     }

//     result = dependencyResult(options);

//     if (result) {
//       return result;
//     }

//     cacheError = _.isUndefined(options.cacheError) || options.cacheError;

//     if (cacheError) {
//       error = failedFetches[options.id];

//       if (error) {
//         return failed(error);
//       }
//     }

//     if (fetchInProgress[options.id]) {
//       return fetchResult.pending(options.id, store);
//     }

//     if (context) {
//       context.fetchStarted(store.id, options.id);
//     }

//     return tryAndGetLocally(this) || tryAndGetRemotely(this);

//     function tryAndGetLocally(store) {
//       try {
//         var result = options.locally.call(store);

//         if (_.isUndefined(result)) {
//           return;
//         }

//         if (_.isNull(result)) {
//           return notFound();
//         }

//         finished();
//         return fetchResult.done(result, options.id, store);
//       } catch (error) {
//         failed(error);

//         return fetchResult.failed(error, options.id, store);
//       }
//     }

//     function tryAndGetRemotely(store) {
//       try {
//         result = options.remotely.call(store);

//         if (result) {
//           if (_.isFunction(result.then)) {
//             fetchInProgress[options.id] = true;

//             result.then(function () {
//               fetchHistory[options.id] = true;
//               result = tryAndGetLocally(store);

//               if (result) {
//                 finished();
//                 hasChanged();
//               } else {
//                 notFound();
//                 hasChanged();
//               }
//             }).catch(function (error) {
//               failed(error);
//               hasChanged();
//             });

//             return fetchResult.pending(options.id, store);
//           } else {
//             fetchHistory[options.id] = true;
//             result = tryAndGetLocally(store);

//             if (result) {
//               return result;
//             }
//           }
//         }

//         if (warnings.promiseNotReturnedFromRemotely) {
//           log.warn(promiseNotReturnedWarning());
//         }

//         return notFound();
//       } catch (error) {
//         return failed(error);
//       }
//     }

//     function promiseNotReturnedWarning() {
//       var inStore = '';
//       if (store.displayName) {
//         inStore = ' in ' + store.displayName;
//       }

//       return 'The remote fetch for \'' + options.id + '\'' +
//         inStore + ' did not return a promise and the state was ' +
//         'not present after remotely finished executing. ' +
//         'This might be because you forgot to return a promise.';
//     }

//     function finished() {
//       fetchHistory[options.id] = true;
//       delete fetchInProgress[options.id];

//       if (context) {
//         context.fetchFinished(store.id, options.id);
//       }
//     }

//     function failed(error) {
//       if (cacheError) {
//         failedFetches[options.id] = error;
//       }

//       finished();

//       return fetchResult.failed(error, options.id, store);
//     }

//     function notFound() {
//       return failed(new NotFoundError(), options.id, store);
//     }
//   }

//   function dependencyResult(options) {
//     if (options.dependsOn) {
//       if (_.isArray(options.dependsOn)) {
//         var pending = false;
//         var dependencyErrors = [];
//         for (var i = 0; i < options.dependsOn.length; i++) {
//           var dependency = options.dependsOn[i];

//           switch (dependency.status) {
//             case StatusConstants.PENDING.toString():
//               pending = true;
//               break;
//             case StatusConstants.FAILED.toString():
//               dependencyErrors.push(dependency.error);
//               break;
//           }
//         }

//         if (dependencyErrors.length) {
//           var error = new CompoundError(dependencyErrors);
//           return fetchResult.failed(error, options.id, store);
//         }

//         if (pending) {
//           return fetchResult.pending(options.id, store);
//         }
//       } else {
//         if (!options.dependsOn.done) {
//           return options.dependsOn;
//         }
//       }
//     }
//   }

//   function clear() {
//     failedFetches = {};
//     fetchInProgress = {};
//     this.state = this.getInitialState();

//     if (_.isFunction(options.clear)) {
//       options.clear.call(this);
//     }
//   }

//   function setState(newState) {
//     if (store.__state !== newState) {
//       store.__state = newState;
//       this.hasChanged(newState);
//     }
//   }

//   function getState() {
//     return store.__state;
//   }



//   function hasChanged(eventArgs) {
//     emitter.emit.call(emitter, CHANGE_EVENT, this.state, this, eventArgs);
//   }

//   function handleAction(action) {
//     var handlers = _.object(_.map(this.handlers, getHandlerWithPredicates));

//     _.each(handlers, function (predicates, handlerName) {
//       _.each(predicates, function (predicate) {
//         if (predicate(action)) {
//           var rollbackHandler, actionHandler;
//           var handler = action.addStoreHandler(this, handlerName, predicate.toJSON());

//           try {
//             this.action = action;
//             actionHandler = this[handlerName];

//             if (actionHandler) {
//               rollbackHandler = actionHandler.apply(this, action.arguments);
//             } else {
//               throw new ActionHandlerNotFoundError(handlerName, this);
//             }
//           } catch (e) {
//             var errorMessage = 'An error occured while trying to handle an \'' +
//             action.type.toString() + '\' action in the action handler `' + handlerName + '`';

//             var displayName = store.displayName || store.id;

//             if (displayName) {
//               errorMessage += ' within the store ' + displayName;
//             }

//             log.error(errorMessage, e, action);

//             handler.failed(e);
//             throw e;
//           } finally {
//             this.action = null;

//             action.addRollbackHandler(rollbackHandler, this);

//             if (handler) {
//               handler.dispose();
//             }
//           }
//         }
//       }, this);
//     }, this);

//     function getHandlerWithPredicates(actionPredicates, handler) {
//       _.isArray(actionPredicates) || (actionPredicates = [actionPredicates]);

//       var predicates = _.map(actionPredicates, toFunc);

//       return [handler, predicates];

//       function toFunc(actionPredicate) {
//         if (actionPredicate.isActionCreator) {
//           actionPredicate = {
//             type: actionPredicate.toString()
//           };
//         } else if (_.isString(actionPredicate)) {
//           actionPredicate = {
//             type: actionPredicate
//           };
//         }

//         var func = _.matches(actionPredicate);

//         func.toJSON = function () {
//           return actionPredicate;
//         };

//         return func;
//       }
//     }
//   }

//   function waitFor(stores) {
//     if (!_.isArray(stores)) {
//       stores = _.toArray(arguments);
//     }

//     dispatcher.waitFor(dispatchTokens(stores));

//     function dispatchTokens(stores) {
//       var tokens = [];

//       _.each(stores, function (store) {
//         if (store.dispatchToken) {
//           tokens.push(store.dispatchToken);
//         }

//         if (_.isString(store)) {
//           tokens.push(store);
//         }
//       });

//       return tokens;
//     }
//   }
// }

// module.exports = Store;

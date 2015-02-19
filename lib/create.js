var _ = require('underscore');
var Store = require('./store');
var warnings = require('./warnings');
var constants = require('./constants');
var STORE_CHANGED_EVENT = 'store-changed';
var createClass = require('./createClass');
var StateMixin = require('./mixins/stateMixin');

module.exports = {
  register: register,
  createStore: createStore,
  createContext: createContext,
  createConstants: createConstants,
  createStateMixin: createStateMixin,
  createStateSource: createStateSource,
  createActionCreators: createActionCreators,
  addStoreChangeListener: addStoreChangeListener
};

function register(clazz) {

}

function addStoreChangeListener(callback, context) {
  var events = this.__events;

  if (context) {
    callback = _.bind(callback, context);
  }

  events.on(STORE_CHANGED_EVENT, callback);

  return {
    dispose: _.bind(function () {
      events.removeListener(STORE_CHANGED_EVENT, callback);
    }, this)
  };
}

function createContext(req) {
  return this.container.createContext(req);
}

function createStore(properties) {
  var StoreClass = createClass(properties, Store);
  var defaultInstance = this.container.registerStore(StoreClass);

  warnings.without('callingResolverOnServer', function () {
    defaultInstance.addChangeListener(_.bind(onStoreChanged, this));
  }, this);

  return defaultInstance;
}

function onStoreChanged() {
  var events = this.__events;
  var args = _.toArray(arguments);

  args.unshift(STORE_CHANGED_EVENT);
  events.emit.apply(events, args);
}

function createConstants(obj) {
  return constants(obj);
}

function createStateMixin(options) {
  return new StateMixin(options);
}

function createActionCreators(options) {
  return this.container.registerActionCreators(options);
}

function createStateSource(options) {
  return this.container.registerStateSource(options);
}
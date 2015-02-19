var EventEmitter = require('events').EventEmitter;

var DEFAULT_MAX_LISTENERS = 10000000;

var StoreInstances = {
  instances: {},
  get(store) {
    return this.instances[this.getStoreId(store)];
  },
  getStoreId(store) {
    var id = store.__id;

    if (!id) {
      throw new Error('Store does not have an Id');
    }

    return id;
  },
  createStoreInstance(store, options) {
    var id = this.getStoreId(store);

    if (this.instances[id]) {
      throw new Error('There is already an instance for the store ' + id);
    }

    options = options || {};

    var instance = {
      state: {},
      defaultState: {},
      fetchHistory: {},
      failedFetches: {},
      fetchInProgress: {},
      emitter: new EventEmitter(),
      dispatcher: options.dispatcher || Dispatcher.getDefault()
    };

    instance.emitter.setMaxListeners(DEFAULT_MAX_LISTENERS);

    this.instances[id] = instance;

    return instance;
  }
};

module.exports = StoreInstances;
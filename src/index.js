/* eslint no-undef: 0, import/no-dynamic-require: 0 */
import Events from 'events';
const DEFAULT_DELAY = jasmine ? jasmine.DEFAULT_TIMEOUT_INTERVAL - 1 : 1000;
const redux = require(require.resolve('redux'));
const realCreateStore = redux.createStore;
const applyMiddleware = redux.applyMiddleware;
const combineReducers = redux.combineReducers;
const bindActionCreators = redux.bindActionCreators;

export { applyMiddleware, combineReducers, bindActionCreators };

class ActionEventEmitter extends Events {
  constructor(...args) {
    super(...args);
    this.actionsHistory = [];
    this.tickQueue = [];
  }

  onTick(callback) {
    this.tickQueue.push(callback);
  }

  tick() {
    const copyQueue = this.tickQueue.splice(0, this.tickQueue.length);
    copyQueue.forEach(callback => callback());
  }

  push(action) {
    this.actionsHistory.push(action);
    this.emit('action', action);
  }

  beforePush(action) {
    this.emit('beforeAction', action);
  }

  clear() {
    this.actionsHistory = [];
  }

  on(actionName, callback) {
    const handler = (action) => {
      if (action.type === actionName || actionName === '*') {
        this.onTick(() => callback(action));
      }
    };
    super.on('action', handler);
    return () => {
      super.removeListener('action', handler);
    };
  }

  removeListener(handler) {
    return super.removeListener('action', handler);
  }

  waitFor(actionName, failDelay = DEFAULT_DELAY) {
    return new Promise((resolve, reject) => {
      let delay;
      const handler = (action) => {
        if (actionName === '*' || action.type === actionName) {
          this.removeListener(handler);
          clearTimeout(delay);
          resolve(action);
        }
      };
      delay = setTimeout(() => {
        this.removeListener(handler);
        reject(new Error(`Event ${actionName} timeout`));
      }, failDelay);
      this.on(actionName, handler);
    });
  }

  before(actionName, callback) {
    const handler = (action) => {
      if (actionName === '*' || actionName === action.type) {
        super.removeListener('beforeAction', handler)
        callback(action);
      }
    };
    super.on('beforeAction', handler);
    return () => super.removeListener('beforeAction', handler);
  }

  beforeEach(actionName, callback) {
    const handler = (action) => {
      if (actionName === '*' || actionName === action.type) {
        callback(action);
      }
    };
    super.on('beforeAction', handler);
    return () => super.removeListener('beforeAction', handler);
  }

  after(actionName) {
    const foundedAction = this.actionsHistory.reverse().find(action => action.type === actionName);
    this.actionsHistory.reverse();
    return foundedAction ? Promise.resolve(foundedAction) : this.waitFor(actionName);
  }

  record(actionName, handler) {
    this.actionsHistory.filter(action => (actionName === '*' || action.type === actionName))
    .forEach(handler);
    return this.on(actionName, handler);
  }
}

function wrapReducer(actionEvents, reducer) {
  return function wrappedReducer(state, action) {
    actionEvents.beforePush(action);
    const reducerFeedback = reducer(state, action);
    actionEvents.push(action);
    return reducerFeedback;
  };
}

export function createStore(reducer, middlewares) {
  const actionEvents = new ActionEventEmitter();
  const wrappedReducer = wrapReducer(actionEvents, reducer);
  const store = realCreateStore(wrappedReducer, middlewares);
  store.subscribe(actionEvents::actionEvents.tick);
  const origDispatch = store.dispatch;
  store.dispatch = (...args) => origDispatch(...args);
  store.dispatch.clear = actionEvents::actionEvents.clear;
  store.dispatch.on = actionEvents::actionEvents.on;
  store.dispatch.waitFor = actionEvents::actionEvents.waitFor;
  store.dispatch.after = actionEvents::actionEvents.after;
  store.dispatch.record = actionEvents::actionEvents.record;
  store.dispatch.removeListener = actionEvents::actionEvents.removeListener;
  store.dispatch.removeAllListeners = actionEvents::actionEvents.removeAllListeners;
  store.dispatch.before = actionEvents::actionEvents.before;
  store.dispatch.beforeEach = actionEvents::actionEvents.beforeEach;
  const origReplaceReducer = store.replaceReducer;
  store.replaceReducer = function monkeyReplaceReducer(newReducer) {
    origReplaceReducer(wrapReducer(actionEvents, newReducer));
  };
  return store;
}

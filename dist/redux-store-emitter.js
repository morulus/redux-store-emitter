'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.bindActionCreators = exports.combineReducers = exports.applyMiddleware = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

exports.createStore = createStore;

var _events = require('events');

var _events2 = _interopRequireDefault(_events);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; } /* eslint no-undef: 0, import/no-dynamic-require: 0 */


var DEFAULT_DELAY = jasmine ? jasmine.DEFAULT_TIMEOUT_INTERVAL - 1 : 1000;
var redux = require(require.resolve('redux'));
var realCreateStore = redux.createStore;
var applyMiddleware = redux.applyMiddleware;
var combineReducers = redux.combineReducers;
var bindActionCreators = redux.bindActionCreators;

exports.applyMiddleware = applyMiddleware;
exports.combineReducers = combineReducers;
exports.bindActionCreators = bindActionCreators;

var ActionEventEmitter = function (_Events) {
  _inherits(ActionEventEmitter, _Events);

  function ActionEventEmitter() {
    var _ref;

    _classCallCheck(this, ActionEventEmitter);

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var _this = _possibleConstructorReturn(this, (_ref = ActionEventEmitter.__proto__ || Object.getPrototypeOf(ActionEventEmitter)).call.apply(_ref, [this].concat(args)));

    _this.actionsHistory = [];
    _this.tickQueue = [];
    return _this;
  }

  _createClass(ActionEventEmitter, [{
    key: 'onTick',
    value: function onTick(callback) {
      this.tickQueue.push(callback);
    }
  }, {
    key: 'tick',
    value: function tick() {
      var copyQueue = this.tickQueue.splice(0, this.tickQueue.length);
      copyQueue.forEach(function (callback) {
        return callback();
      });
    }
  }, {
    key: 'push',
    value: function push(action) {
      this.actionsHistory.push(action);
      this.emit('action', action);
    }
  }, {
    key: 'beforePush',
    value: function beforePush(action) {
      this.emit('beforeAction', action);
    }
  }, {
    key: 'clear',
    value: function clear() {
      this.actionsHistory = [];
    }
  }, {
    key: 'on',
    value: function on(actionName, callback) {
      var _this2 = this;

      var handler = function handler(action) {
        if (action.type === actionName || actionName === '*') {
          _this2.onTick(function () {
            return callback(action);
          });
        }
      };
      _get(ActionEventEmitter.prototype.__proto__ || Object.getPrototypeOf(ActionEventEmitter.prototype), 'on', this).call(this, 'action', handler);
      return function () {
        _get(ActionEventEmitter.prototype.__proto__ || Object.getPrototypeOf(ActionEventEmitter.prototype), 'removeListener', _this2).call(_this2, 'action', handler);
      };
    }
  }, {
    key: 'removeListener',
    value: function removeListener(handler) {
      return _get(ActionEventEmitter.prototype.__proto__ || Object.getPrototypeOf(ActionEventEmitter.prototype), 'removeListener', this).call(this, 'action', handler);
    }
  }, {
    key: 'waitFor',
    value: function waitFor(actionName) {
      var _this3 = this;

      var failDelay = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : DEFAULT_DELAY;

      return new Promise(function (resolve, reject) {
        var delay = void 0;
        var handler = function handler(action) {
          if (actionName === '*' || action.type === actionName) {
            _this3.removeListener(handler);
            clearTimeout(delay);
            resolve(action);
          }
        };
        delay = setTimeout(function () {
          _this3.removeListener(handler);
          reject(new Error('Event ' + actionName + ' timeout'));
        }, failDelay);
        _this3.on(actionName, handler);
      });
    }
  }, {
    key: 'before',
    value: function before(actionName, callback) {
      var _this4 = this;

      var handler = function handler(action) {
        if (actionName === '*' || actionName === action.type) {
          _get(ActionEventEmitter.prototype.__proto__ || Object.getPrototypeOf(ActionEventEmitter.prototype), 'removeListener', _this4).call(_this4, 'beforeAction', handler);
          callback(action);
        }
      };
      _get(ActionEventEmitter.prototype.__proto__ || Object.getPrototypeOf(ActionEventEmitter.prototype), 'on', this).call(this, 'beforeAction', handler);
      return function () {
        return _get(ActionEventEmitter.prototype.__proto__ || Object.getPrototypeOf(ActionEventEmitter.prototype), 'removeListener', _this4).call(_this4, 'beforeAction', handler);
      };
    }
  }, {
    key: 'beforeEach',
    value: function beforeEach(actionName, callback) {
      var _this5 = this;

      var handler = function handler(action) {
        if (actionName === '*' || actionName === action.type) {
          callback(action);
        }
      };
      _get(ActionEventEmitter.prototype.__proto__ || Object.getPrototypeOf(ActionEventEmitter.prototype), 'on', this).call(this, 'beforeAction', handler);
      return function () {
        return _get(ActionEventEmitter.prototype.__proto__ || Object.getPrototypeOf(ActionEventEmitter.prototype), 'removeListener', _this5).call(_this5, 'beforeAction', handler);
      };
    }
  }, {
    key: 'after',
    value: function after(actionName) {
      var foundedAction = this.actionsHistory.reverse().find(function (action) {
        return action.type === actionName;
      });
      this.actionsHistory.reverse();
      return foundedAction ? Promise.resolve(foundedAction) : this.waitFor(actionName);
    }
  }, {
    key: 'record',
    value: function record(actionName, handler) {
      this.actionsHistory.filter(function (action) {
        return actionName === '*' || action.type === actionName;
      }).forEach(handler);
      return this.on(actionName, handler);
    }
  }]);

  return ActionEventEmitter;
}(_events2.default);

function wrapReducer(actionEvents, reducer) {
  return function wrappedReducer(state, action) {
    actionEvents.beforePush(action);
    var reducerFeedback = reducer(state, action);
    actionEvents.push(action);
    return reducerFeedback;
  };
}

function createStore(reducer, middlewares) {
  var actionEvents = new ActionEventEmitter();
  var wrappedReducer = wrapReducer(actionEvents, reducer);
  var store = realCreateStore(wrappedReducer, middlewares);
  store.subscribe(actionEvents.tick.bind(actionEvents));
  var origDispatch = store.dispatch;
  store.dispatch = function () {
    return origDispatch.apply(undefined, arguments);
  };
  store.dispatch.clear = actionEvents.clear.bind(actionEvents);
  store.dispatch.on = actionEvents.on.bind(actionEvents);
  store.dispatch.waitFor = actionEvents.waitFor.bind(actionEvents);
  store.dispatch.after = actionEvents.after.bind(actionEvents);
  store.dispatch.record = actionEvents.record.bind(actionEvents);
  store.dispatch.removeListener = actionEvents.removeListener.bind(actionEvents);
  store.dispatch.removeAllListeners = actionEvents.removeAllListeners.bind(actionEvents);
  store.dispatch.before = actionEvents.before.bind(actionEvents);
  store.dispatch.beforeEach = actionEvents.beforeEach.bind(actionEvents);
  var origReplaceReducer = store.replaceReducer;
  store.replaceReducer = function monkeyReplaceReducer(newReducer) {
    origReplaceReducer(wrapReducer(actionEvents, newReducer));
  };
  return store;
}

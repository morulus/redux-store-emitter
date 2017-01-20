Redux-store-emitter
--

Decoration for [redux](https://github.com/reactjs/redux), that gives him the ability to distribute events.

# Install

```
npm i redux-store-emitter -S
```

# Usage

It used just like a redux.
```js
import { createStore } from 'redux-store-emitter';
import rootReducer from './reducer';
const store = createStore(rootReducer);
```
## Usage with Jest

Best way to use it with [Jest](https://facebook.github.io/jest/) is mock redux, by creating `redux.js` in `__mocks__` directory.
```js
// __mocks__/redux.js
export * from 'redux-store-emitter';
```
Then you can mock redux with jest:
```js
jest.mock('redux');
import { createStore } from 'redux';
```

## API

Decorator adds own methods to the function `dispatch`:

### store.dispatch.on(actionName, callback):fn

Add a listener to the action. The callback function will be executed each time the target action will affect to the state.

Arguments:
- **actionName** {string} Action name
- **callback** {function} Event handler

**Returns**: {function} Listener destoyer

```js
store.dispatch.on(
  ADD_TODO,
  action => console.log(action.todo)
);
store.dispatch(todo('Just do')); // <--
store.dispatch(todo('Just do it again')); // <--
// Console: Just do
// Console: Just do it again
```
An important fact is that the function will be called only when the action will trigger a subscription.

### store.dispatch.after(actionName):promise
The promise will be resolved immediately if the action has already occurred or it will be resolved at the next action dispatch.

Arguments:
- **actionName** {string} Action name

**Returns**: {promise}

```js
store.dispatch(todo('Just do')); // <--
store.dispatch.after(
  ADD_TODO
).then(action => console.log(action.todo));
// Console: Just do
store.dispatch(todo('Just do it again'));
```
Or:
```js
store.dispatch.after(
  ADD_TODO
).then(action => console.log(action.todo));
store.dispatch(todo('Just do')); // <--
store.dispatch(todo('Just do it again'));
// Console: Just do
```

### store.dispatch.record(actionName, callback):fn
The callback function will be called for each action that has already occurred and for each all next.

Arguments:
- **actionName** {string} Action name
- **callback** {function} Event handler

**Returns**: {function} Listener destoyer

```js
store.dispatch(todo('Just do')); // <--
store.dispatch(todo('Just do it again')); // <--
store.dispatch(todo('Do it always')); // <--
store.dispatch.record(
  ADD_TODO,
  action => console.log(action.todo)
);
store.dispatch(todo('Forever')); // <--
// Console: Just do
// Console: Just do it again
// Console: Do it always
// Console: Forever
```

### store.dispatch.before(actionName, callback):fn
The callback function will be called once before the action will be passed to the reducer. Thus, you get a state without the effect of the action.

Arguments:
- **actionName** {string} Action name
- **callback** {function} Event handler

**Returns**: {function} Listener destroyer

```js
const INCREASE = 'INCREASE';
const INIT = { count: 1 };
function rootReducer(state = INIT, action) {
  switch (action.type) {
    case INCREASE:
      return {
        count: state.count + 1
      };
    default:
      return state;
  }
}

const store = createStore(rootReducer);
store.dispatch.before(
  INCREASE,
  () => console.log('before', store.getState().count)
);
store.dispatch.after(INCREASE)
.then(() => console.log('after', store.getState().count));
store.dispatch({ type: INCREASE }); // <~~
// Console: before 1
// Console: after 2
```

### store.dispatch.beforeEach(actionName, callback):fn
The callback function will be called for each time, before the action will be passed to the reducer.

Arguments:
- **actionName** {string} Action name
- **callback** {function} Event handler

**Returns**: {function} Listener destroyer

Works same as method `before`, but countless times.

### store.dispatch.waitFor(actionName):promise
The callback function will be executed once when the action will affect the state.

Arguments:
- **actionName** {string} Action name

**Returns**: {promise}


```js
store.dispatch(todo('Do it'));
store.dispatch.waitFor(ADD_TODO)
.then(action => console.log);
store.dispatch(todo('Do it again')); // <--
// Console: Do it again
```

### store.dispatch.clear()

Erases all actions history.

## Author

Vladimir Kalmykov <vladimirmorulus@gmail.com>

## License
MIT

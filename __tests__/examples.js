jest.mock('redux');
import { createStore } from 'redux';

const ADD_TODO = 'ADD_TODO';
const INITIAL_STATE = {
  todos: [],
};
function todo(name) {
  return {
    type: ADD_TODO,
    todo: name,
  };
}

function rootReducer(state = INITIAL_STATE, action) {
  switch (action.type) {
    case ADD_TODO:
      return {
        todos: state.todos.concat(action.todo)
      };
    default:
      return state;
  }
}

const store = createStore(rootReducer);

describe('Examples', () => {
  beforeEach(() => store.dispatch.clear());
  it('store.dispatch.on', () => {
    const fn = jest.fn();
    store.dispatch.on(
      ADD_TODO,
      fn
    );
    store.dispatch(todo('Just do')); // <--
    store.dispatch(todo('Just do it again')); // <--
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('store.dispatch.on', () => {
    const fn = jest.fn(function(action) {
      expect(action.todo).toEqual('Just do');
    });
    store.dispatch(todo('Just do')); // <--
    const wait = store.dispatch.after(
      ADD_TODO
    ).then(fn);
    // Console: Just do
    store.dispatch(todo('Just do it again'));

    return wait;
  });

  it('store.dispatch.on / 2', () => {
    const fn = jest.fn(function(action) {
      expect(action.todo).toEqual('Just do');
    });
    const wait = store.dispatch.after(
      ADD_TODO
    ).then(fn);
    store.dispatch(todo('Just do')); // <--
    store.dispatch(todo('Just do it again'));
    // Console: Just do
    return wait;
  });

  it('store.dispatch.record / 2', () => {
    const fn = jest.fn();
    store.dispatch(todo('Just do')); // <--
    store.dispatch(todo('Just do it again')); // <--
    store.dispatch(todo('Do it always')); // <--
    store.dispatch.record(
      ADD_TODO,
      fn
    );
    store.dispatch(todo('Forever')); // <--
    // Console: Just do
    // Console: Just do it again
    // Console: Do it always
    // Console: Forever
    expect(fn).toHaveBeenCalledTimes(4);
  });

  it('store.dispatch.before', () => {
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

    const beforeHandler = jest.fn(() => {
      expect(store.getState().count).toEqual(1);
    });

    const afterHandler = jest.fn(() => {
      expect(store.getState().count).toEqual(2);
    });

    store.dispatch.before(
      INCREASE,
      beforeHandler
    );
    const wait = store.dispatch.after(INCREASE)
    .then(afterHandler);
    store.dispatch({ type: INCREASE }); // <~~
    // Console: before 1
    // Console: after 2
    return wait
    .then(() => {
      expect(beforeHandler).toHaveBeenCalledTimes(1);
      expect(afterHandler).toHaveBeenCalled();
    });
  });

  it('store.dispatch.waitFor', () => {
    const handler = jest.fn(action => expect(action.todo).toEqual('Do it again'));
    store.dispatch(todo('Do it'));
    const wait = store.dispatch.waitFor(ADD_TODO)
    .then(handler);
    store.dispatch(todo('Do it again')); // <--
    // Console: Do it again
    return wait;
  });
});

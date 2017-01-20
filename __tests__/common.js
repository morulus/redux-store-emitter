jest.mock('redux');
import { createStore } from 'redux';
const DO_NOTHING = 'DO_NOTHING';
const RESET = 'RESET';
const INCREASE_T = 'INCREASE_T';
const INCREASE_R = 'INCREASE_R';
const INCREASE_A = 'INCREASE_A';
const INCREASE_M = 'INCREASE_M';
const INCREASE_P = 'INCREASE_P';

function action(actionName) {
  return { type: actionName };
}

const INITIAL_STATE = {
  t: 1,
  r: 2,
  a: 3,
  m: 5,
  p: 8,
}
const rootReducer = (state = INITIAL_STATE, action) => {
  switch (action.type) {
    case RESET:
      return INITIAL_STATE;
    case INCREASE_T:
      return {
        ...state,
        t: state.t + 1,
      };
    case INCREASE_R:
      return {
        ...state,
        r: state.r + 1,
      };
    case INCREASE_A:
      return {
        ...state,
        a: state.a + 1,
      };
    case INCREASE_M:
      return {
        ...state,
        m: state.m + 1,
      };
    case INCREASE_P:
      return {
        ...state,
        p: state.p + 1,
      };
    default:
      return state;
  }
}
const store = createStore(rootReducer);
describe('on', () => {
  const plan = [INCREASE_T,INCREASE_R,INCREASE_A,INCREASE_M,INCREASE_P].map(a=>action(a));
  const planInAction = plan[Symbol.iterator]();
  beforeAll(function() {
    store.dispatch.clear();
  });
  it('expect INCREASE_T', () => {
    const fn = jest.fn();
    store.dispatch.on(INCREASE_T, fn);
    store.dispatch(planInAction.next().value);
    expect(fn).toHaveBeenCalled();
  });
  it('expect INCREASE_R', () => {
    const fn = jest.fn();
    store.dispatch.on(INCREASE_R, fn);
    store.dispatch(planInAction.next().value);
    expect(fn).toHaveBeenCalled();
  });
  it('expect INCREASE_A', () => {
    const fn = jest.fn();
    store.dispatch.on(INCREASE_A, fn);
    store.dispatch(planInAction.next().value);
    expect(fn).toHaveBeenCalled();
  });
  it('expect INCREASE_M', () => {
    const fn = jest.fn();
    store.dispatch.on(INCREASE_M, fn);
    store.dispatch(planInAction.next().value);
    expect(fn).toHaveBeenCalled();
  });
  it('expect INCREASE_P', () => {
    const fn = jest.fn();
    store.dispatch.on(INCREASE_P, fn);
    store.dispatch(planInAction.next().value);
    expect(fn).toHaveBeenCalled();
  });
});

describe('after', () => {
  it('expect INCREASE_T', () => {
    const fn = jest.fn();
    return store.dispatch.after(INCREASE_T);
  });
  it('expect INCREASE_R', () => {
    const fn = jest.fn();
    return store.dispatch.after(INCREASE_R);
  });
  it('expect INCREASE_A', () => {
    const fn = jest.fn();
    return store.dispatch.after(INCREASE_A);
  });
  it('expect INCREASE_M', () => {
    const fn = jest.fn();
    return store.dispatch.after(INCREASE_M);
  });
  it('expect INCREASE_P', () => {
    const fn = jest.fn();
    return store.dispatch.after(INCREASE_P);
  });
});

describe('record', () => {
  it('expect INCREASE_T dispatched once', () => {
    const fn = jest.fn();
    store.dispatch.record(INCREASE_T, fn);
    expect(fn).toHaveBeenCalledTimes(1);
  });
  it('expect * dispatch 5/6 times', () => {
    const fn = jest.fn();
    store.dispatch.record('*', fn);
    expect(fn).toHaveBeenCalledTimes(5);
    store.dispatch(action('JUST_ACTION'));
    expect(fn).toHaveBeenCalledTimes(6);
  });
});

describe('before', () => {
  it('expect before INCREASE_T will be called', () => {
    let t = store.getState().t;
    const fnBefore = jest.fn(function() {
      expect(t).toEqual(store.getState().t);
    });
    const fnAfter = jest.fn(function() {
      expect(t).not.toEqual(store.getState().t);
    });
    const wait = Promise.all([
      store.dispatch.before(INCREASE_T, fnBefore),
      store.dispatch.after(INCREASE_T).then(fnAfter)
    ]).then(() => {
      expect(fnAfter).toHaveBeenCalledTimes(1);
      expect(fnBefore).toHaveBeenCalledTimes(1);
    });
    store.dispatch(action(INCREASE_T));
    return wait;
  });
});

describe('progress', () => {
  beforeAll(() => {
    store.dispatch.clear();
    store.dispatch(action(RESET));
  });
  it('expect each reaction will meet state', () => {
    const scenario = [2,3,4,5,6];
    const scenarioInAction = scenario[Symbol.iterator]();
    function handler() {
      // expect(store.getState().t).toEqual(scenarioInAction.next().value);
    }
    store.dispatch.on(INCREASE_T, handler);
    store.dispatch(action(INCREASE_T));
    store.dispatch(action(INCREASE_T));
    store.dispatch(action(INCREASE_T));
    store.dispatch(action(INCREASE_T));
    store.dispatch(action(INCREASE_T));
  });
});

describe('No affect', () => {
  it ('Wait for action with no effect', () => {
    const waitForAction = store.dispatch.waitFor(DO_NOTHING);
    store.dispatch(action(DO_NOTHING));
    return waitForAction
    .then(action => expect(action.type).toEqual(DO_NOTHING));
  });
});

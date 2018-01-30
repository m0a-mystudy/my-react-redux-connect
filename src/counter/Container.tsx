import { Counter } from './Counter';
import * as ReactRedux from 'react-redux';
import { Dispatch } from 'redux';
import { decrementAmount, incrementAmount } from './module';
import { ReduxAction, ReduxState } from '../store';

export class ActionDispatcherBase {
  constructor(protected dispatch: (action: ReduxAction) => void, rootState: ReduxState) { }
}

export class ActionDispatcher extends ActionDispatcherBase {

  public increment(amount: number) {
    this.dispatch(incrementAmount(amount));
  }

  public decrement(amount: number) {
    this.dispatch(decrementAmount(amount));
  }
}

interface MyMergeProps<T> {
  (state: ReduxState, dispatch: Dispatch<ReduxAction>, onwProps: T): T;
}

function Myconnect<T>(actionDispatcher: typeof ActionDispatcherBase, mergeProps: MyMergeProps<T>) {
  return ReactRedux.connect(
    (state: ReduxState) => ({ state }),
    (dispatch: Dispatch<ReduxAction>) => ({ dispatch }),
    ({ state }, { dispatch }, onwProps: T) => {
      const pp = mergeProps(state, dispatch, onwProps);
      return (
        Object.assign({}, {
          actions: new actionDispatcher(dispatch, state)
        }, pp)
      );
    });
}

// export default ReactRedux.connect(
//   (state: ReduxState) => ({ state }),
//   (dispatch: Dispatch<ReduxAction>) => ({ dispatch }),
//   ({ state }, { dispatch }, onwProps) => ({
//     actions: new ActionDispatcher(dispatch, state),
//     value: state.counter,
//   })
// )(Counter);

export default Myconnect(
  ActionDispatcher, (state, dispatch, ownprops) => ({
  value: state.counter,
}))(Counter);
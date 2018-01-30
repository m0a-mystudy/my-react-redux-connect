import { Counter, Props } from './Counter';
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

interface MyMergeProps<T extends {actions: ActionDispatcherBase}> {
  (state: ReduxState, dispatch: Dispatch<ReduxAction>, ownProps: T): T;
}
function Myconnect<T extends {actions: ActionDispatcherBase}>(
    actionDispatcher: typeof ActionDispatcherBase, 
    mergeProps: MyMergeProps<T>): ReactRedux.InferableComponentEnhancer<T>  {
  return ReactRedux.connect(
    (state: ReduxState) => ({ state }),
    (dispatch: Dispatch<ReduxAction>) => ({ dispatch }),
    ({ state }, { dispatch }, ownProps: T) => {
      const pp = mergeProps(state, dispatch, ownProps);
      return (
        Object.assign({}, pp, { actions: new actionDispatcher(dispatch, state)})
      );
    });
}

export default Myconnect<Props>(
  ActionDispatcher, (state, dispatch, ownProps) => ({
  ...ownProps,
  value: state.counter,
}))(Counter);
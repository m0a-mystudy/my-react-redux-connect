import { Counter } from './Counter';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';
import { decrementAmount, incrementAmount } from './module';
import { ReduxAction, ReduxState } from '../store';

export class ActionDispatcher {
  constructor(private dispatch: (action: ReduxAction) => void, rootState: ReduxState) { }

  public increment(amount: number) {
    this.dispatch(incrementAmount(amount));
  }

  public decrement(amount: number) {
    this.dispatch(decrementAmount(amount));
  }
}

export default connect(
  (state: ReduxState) => ({ state }),
  (dispatch: Dispatch<ReduxAction>) => ({ dispatch }),
  ({state}, {dispatch}, onwProps) => ({
    actions: new ActionDispatcher(dispatch, state),
    value: state.counter,
  })
)(Counter);
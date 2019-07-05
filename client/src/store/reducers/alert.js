import * as actionTypes from '../actions/actionTypes';

const initalState = [];

export default function(state = initalState, action) {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.SET_ALERT:
      return [...state, payload];

    case actionTypes.REMOVE_ALERT:
      return state.filter(alert => alert.id !== payload);   

    default:
      return state;
  }
}

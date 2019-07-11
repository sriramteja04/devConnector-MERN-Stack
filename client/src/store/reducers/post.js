import * as actionTypes from '../actions/actionTypes';

const initialState = {
  posts: [],
  post: null,
  loading: true,
  error: {}
};

export default function(state = initialState, action) {
  const { type, payload } = action;
  switch (type) {
    case actionTypes.GET_POST:
      return {
        ...state,
        posts: payload,
        loading: false
      };

    case actionTypes.POST_ERROR:
      return {
        ...state,
        error: payload,
        loading: false
      };

    default:
      return state
  }
}

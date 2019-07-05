import * as actionTypes from './actionTypes';
import uuid from 'uuid';

export const setAlert = (msg, alertType) => dispatch => {
  const id = uuid.v4();
  dispatch({
    type: actionTypes.SET_ALERT,
    payload: { msg, alertType, id }
  });

  setTimeout(() => dispatch({
      type: actionTypes.REMOVE_ALERT,
      payload: id
  }),4000)
};

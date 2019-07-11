import axios from 'axios';

import * as actionTypes from './actionTypes';
import { setAlert } from './alert';

export const getPosts = () => async dispatch => {
  try {
    const res = await axios.get('/api/posts');

    dispatch({
      type: actionTypes.GET_POST,
      payload: res.data
    });
  } catch (err) {
    dispatch({
      type: actionTypes.POST_ERROR,
      payload: { msg: err.response.statusText, status: err.response.status }
    });
  }
};

import * as actionTypes from './actionTypes';
import axios from 'axios';
import { setAlert } from './alert';
import setAuthToken from '../../utils/setAuthToken';

export const register = ({ name, email, password }) => async dispatch => {
  //setting headers
  const config = {
    headers: {
      'Content-type': 'application/json'
    }
  };

  //making json object
  const body = JSON.stringify({ name, email, password });

  try {
    //saving to database
    const res = await axios.post('/api/users', body, config);
    //dispatching respone data
    dispatch({
      type: actionTypes.REGISTER_SUCCESS,
      payload: res.data
    });
    dispatch(loadUser());
  } catch (err) {
    //displaying error messages by dispatching setAlert action creators.
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: actionTypes.REGISTER_FAIL
    });
  }
};

export const loadUser = () => async dispatch => {
  //Setting the tokens in the axios headers
  if (localStorage.token) {
    setAuthToken(localStorage.token);
  }

  try {
    //getting user by providing the token
    const res = await axios.get('/api/auth');

    dispatch({
      type: actionTypes.USER_LOADED,
      payload: res.data
    });
  } catch (error) {
    dispatch({
      type: actionTypes.AUTH_ERROR
    });
  }
};

export const loginUser = (email, password) => async dispatch => {
  const config = {
    headers: {
      'Content-type': 'application/json'
    }
  };
  const body = JSON.stringify({ email, password });
  try {
    const res = await axios.post('/api/auth', body, config);

    //Dispatching login action.
    dispatch({
      type: actionTypes.LOGIN_SUCCESS,
      payload: res.data
    });

    //Loading user by dispatching it.
    dispatch(loadUser());
  } catch (err) {
    //displaying error messages by dispatching setAlert action creators.
    const errors = err.response.data.errors;
    if (errors) {
      errors.forEach(error => dispatch(setAlert(error.msg, 'danger')));
    }
    dispatch({
      type: actionTypes.LOGIN_FAIL
    });
  }
};

//LogOut //Clear Profile
export const logout = () => dispatch => {
  dispatch({ type: actionTypes.CLEAR_PROFILE });
  dispatch({ type: actionTypes.LOGOUT });
};

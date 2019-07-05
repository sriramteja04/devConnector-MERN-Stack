import React, { Fragment, useState } from 'react';
import { Link,Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { loginUser } from '../../store/actions/auth';

const Login = props => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const { email, password } = formData;

  const inputChangeHandler = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async e => {
    e.preventDefault();

    props.loginUser(email, password);
  };

  if(props.isAuthenticated) {
    return <Redirect to="/dashboard"/>
  }

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign In</h1>
      <p className='lead'>
        <i className='fas fa-user' /> Sign In to Your Account
      </p>
      <form className='form' onSubmit={e => submitHandler(e)}>
        <div className='form-group'>
          <input
            value={email}
            onChange={e => inputChangeHandler(e)}
            type='email'
            placeholder='Email Address'
            name='email'
          />
          <small className='form-text'>
            This site uses Gravatar so if you want a profile image, use a Gravatar email
          </small>
        </div>
        <div className='form-group'>
          <input
            value={password}
            onChange={e => inputChangeHandler(e)}
            type='password'
            placeholder='Password'
            name='password'
            minLength='6'
          />
        </div>

        <input type='submit' className='btn btn-primary' value='Login' />
      </form>
      <p className='my-1'>
        Don't have an account? <Link to='/register'>Sign Up</Link>
      </p>
    </Fragment>
  );
};

Login.prototype = {
  loginUser: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(
  mapStateToProps,
  { loginUser }
)(Login);

import React, { Fragment, useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setAlert } from '../../store/actions/alert';
import { register } from '../../store/actions/auth';

const Register = props => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password2: ''
  });
  const { name, email, password, password2 } = formData;

  const inputChangeHandler = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitHandler = async e => {
    e.preventDefault();
    if (password !== password2) {
      props.setAlert('Passwords should match', 'danger');
    } else {
      props.register({ name, email, password });
    }
  };

  if (props.isAuthenticated) {
    
    return <Redirect to='/dashboard' />;
  }

  return (
    <Fragment>
      <h1 className='large text-primary'>Sign Up</h1>
      <p className='lead'>
        <i className='fas fa-user' /> Create Your Account
      </p>
      <form className='form' onSubmit={e => submitHandler(e)}>
        <div className='form-group'>
          <input
            value={name}
            onChange={e => inputChangeHandler(e)}
            type='text'
            placeholder='Name'
            name='name'
            required
          />
        </div>
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
        <div className='form-group'>
          <input
            value={password2}
            onChange={e => inputChangeHandler(e)}
            type='password'
            placeholder='Confirm Password'
            name='password2'
            minLength='6'
          />
        </div>
        <input type='submit' className='btn btn-primary' value='Register' />
      </form>
      <p className='my-1'>
        Already have an account? <Link to='/login'>Sign In</Link>
      </p>
    </Fragment>
  );
};

Register.propTypes = {
  setAlert: PropTypes.func.isRequired,
  register: PropTypes.func.isRequired,
  isAuthenticated: PropTypes.bool
};

const mapStateToProps = state => ({
  isAuthenticated: state.auth.isAuthenticated
});

export default connect(
  mapStateToProps,
  { setAlert, register }
)(Register);

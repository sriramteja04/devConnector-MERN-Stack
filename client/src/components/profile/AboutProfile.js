import React, { Fragment } from 'react';
import PropTypes from 'prop-types';

const AboutProfile = ({
  profile: {
    skills,
    bio,
    user: { name }
  }
}) => {
  return (
    <div className='profile-about bg-light p-2'>
      {bio && (
        <Fragment>
          <h2 className='text-primary'>{name.trim().split(' ')[0]}'s Bio</h2>
          <p>{bio}</p>
        </Fragment>
      )}

      <div className='line' />
      <h2 className='text-primary'>Skill Set</h2>
      <div className='skills'>
        {skills.map((skill, index) => (
          <div key={index} className='p-1'>
            <i className='fa fa-check' /> {skill}
          </div>
        ))}
      </div>
    </div>
  );
};

AboutProfile.propTypes = {};

export default AboutProfile;

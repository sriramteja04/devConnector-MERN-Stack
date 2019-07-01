const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');

const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @route   GET api/profile/me
// @desc    Get Current users profile
// @access  Private
router.get('/me', auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate('user', [
      'name',
      'avatar'
    ]);

    if (!profile) {
      return res.status(404).json({ msg: 'There is no profile for this user' });
    }
    res.json(profile);
  } catch (error) {
    res.status(500).send('Server Error');
  }
});

// @route   POST api/profile/
// @desc    Create or update user profile
// @access  Private
router.post(
  '/',
  [
    auth, //Auth middleware to check the user authentication
    [
      check('status', 'status is required')
        .not()
        .isEmpty(),
      check('skills', 'Skills are required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      company,
      website,
      location,
      status,
      skills,
      bio,
      githubusername,
      youtube,
      facebook,
      twitter,
      instagram,
      linkedin
    } = req.body;

    // creating Profile document.
    const profileFields = {};
    profileFields.user = req.user.id;
    if (company) profileFields.company = company;
    if (website) profileFields.website = website;
    if (location) profileFields.location = location;
    if (status) profileFields.status = status;
    if (bio) profileFields.bio = bio;
    if (githubusername) profileFields.githubusername = githubusername;

    //creating an array for skills.
    if (skills) {
      profileFields.skills = skills.split(',').map(skill => skill.trim());
    }

    profileFields.social = {};
    if (youtube) profileFields.social.youtube = youtube;
    if (twitter) profileFields.social.twitter = twitter;
    if (facebook) profileFields.social.facebook = facebook;
    if (instagram) profileFields.social.instagram = instagram;
    if (linkedin) profileFields.social.linkedin = linkedin;

    try {
      //fetching profile
      let profile = await Profile.findOne({ user: req.user.id });

      //if User exitst update the profile.
      if (profile) {
        profile = await Profile.findOneAndDelete(
          { user: req.user.id },
          { $set: profileFields },
          { new: true }
        );
        res.json(profile);
      }

      //Else create a profile and save to database.
      profile = new Profile(profileFields);
      await profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error);
    }
  }
);

// @route   GET api/profile
// @desc    fetching an array of all profiles from database.
// @access  Private
router.get('/', async (req, res) => {
  try {
    //fetching an array of all profile documents.
    const profile = await Profile.find().populate('user', ['name', 'avatar']);
    if (!profile) {
      return res.status(404).json({ msg: 'No profile found!!!' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/profile/user/user_id
// @desc    fetching a profile with user id.
// @access  public
router.get('/user/:user_id', async (req, res) => {
  try {
    //fetching an array of all profile documents.
    const profile = await Profile.findOne({ user: req.params.user_id }).populate('user', [
      'name',
      'avatar'
    ]);
    if (!profile) {
      return res.status(404).json({ msg: 'profile not found!!!' });
    }
    res.status(200).json(profile);
  } catch (error) {
    console.log(error.message);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'profile not found!!!' });
    }
    res.status(500).send('Server Error');
  }
});

module.exports = router;

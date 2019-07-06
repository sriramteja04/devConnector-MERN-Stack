const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const { check, validationResult } = require('express-validator');
const request = require('request');
const config = require('config');

const Profile = require('../../models/Profile');
const User = require('../../models/User');
const Post = require('../../models/Post');

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

      //if profile exits update the profile.
      if (profile) {
        profile = await Profile.findByIdAndUpdate(
          profile._id,
          { $set: profileFields },
          { new: true }
        );
        return res.json(profile);
      }

      //Else create a profile and save it to database.
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

// @route   DELETE api/profile/
// @desc    deleting a users profile from database
// @access  private
router.delete('/', auth, async (req, res) => {
  try {
    //Fetch profile  by providing logged in user
    const profile = await Profile.findOne({ user: req.user.id });

    if (!profile) {
      return res.status(200).json({ msg: 'Profile not found!!' });
    }

    //delete profile and user
    await Post.deleteMany({ user: req.user.id });
    await Profile.deleteOne({ _id: profile.id });
    await User.findOneAndRemove({ _id: req.user.id });
    res.status(200).json({ msg: 'successfully deleted profile and user' });
  } catch (error) {
    res.status(500).send('server error');
  }
});

// @route   PUT api/profile/experience
// @desc    adding experince in profile document
// @access  private
router.put(
  '/experience',
  [
    auth,
    [
      check('title', 'Please provide Title')
        .not()
        .isEmpty(),
      check('company', 'Please provide Company')
        .not()
        .isEmpty(),
      check('from', 'Please provide From')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.json({ errors: errors.array() });
    }

    const { title, company, location, from, to, current, description } = req.body;

    const expObj = {
      title,
      company,
      location,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      //Pushes to the top of the experience array
      profile.experience.unshift(expObj);
      await profile.save();

      res.json(profile);
    } catch (error) {
      console.log('Profile PUT Method', error);
      res.status(500).send('server error');
    }
  }
);

// @route   DELETE api/profile/experience/:id
// @desc    deleting a document from an array of expereinces
// @access  private
router.delete('/experience/:exp_id', auth, async (req, res) => {
  try {
    //Deleting a document inside an exp array.
    await Profile.findOneAndUpdate(
      { user: req.user.id },
      {
        $pull: { experience: { _id: req.params.exp_id } }
      }
    );

    //fetching profile to send updated profile
    const profile = await Profile.findOne({ user: req.user.id });
    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

// @route   Creating api/profile/education
// @desc    creating a education documents
// @access  private
router.put(
  '/education',
  [
    auth,
    [
      check('school', 'School field should be provided')
        .not()
        .isEmpty(),
      check('degree', 'degree field should be provided')
        .not()
        .isEmpty(),
      check('fieldofstudy', 'Field of study field should be provided')
        .not()
        .isEmpty(),
      check('from', 'from field should be provided')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { school, degree, fieldofstudy, from, to, current, description } = req.body;
    const eduObj = {
      school,
      degree,
      fieldofstudy,
      from,
      to,
      current,
      description
    };

    try {
      const profile = await Profile.findOne({ user: req.user.id });
      profile.education.unshift(eduObj);
      profile.save();
      res.json(profile);
    } catch (error) {
      console.log(error);
      res.status(500) / send('Server Error');
    }
  }
);

// @route   DELETE api/profile/education/:id
// @desc    creating a education documents
// @access  private
router.delete('/education/:edu_id', auth, async (req, res) => {
  try {
    await Profile.findOneAndUpdate(
      { user: req.user.id },
      { $pull: { education: { _id: req.params.edu_id } } },
      { returnNewDocument: true }
    );
    const profile = await Profile.findOne({ user: req.user.id });
    res.json(profile);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/profile/github/:username
// @desc    Get user repos from Github
// @access  public

router.get('/github/:username', (req, res) => {
  try {
    const options = {
      url: `https://api.github.com/users/${
        req.params.username
      }/repos?per_page=5&sort=created:asc&client_id=${config.get(
        'githubClientId'
      )}&client_secret=${config.get('githubSecret')}`,
      method: 'GET',
      headers: { 'user-agent': 'node.js' }
    };

    request(options, (error, response, body) => {
      if (error) console.log(error);

      if (response.statusCode !== 200) {
        return res.status(404).json({ msg: 'No Github profile found' });
      }

      res.json(JSON.parse(body));
    });
  } catch (error) {}
});

module.exports = router;

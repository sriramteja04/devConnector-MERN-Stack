const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../../models/User');

// @route   GET api/users
// @desc    Creating a User
// @access  Public
// @returns Token generated from JWT
router.post(
  '/',
  [
    check('name', 'Name is required')
      .not()
      .isEmpty(),
    check('email', 'Please Enter Valid E-Mail').isEmail(),
    check('password', 'Password should be atleast 6 characters').isLength({ min: 6 })
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });

      //If user exists
      if (user) {
        return res.status(200).json({ errors: [{ msg: 'user already exists' }] });
      }
      const avatar = gravatar.url(email, {
        s: '200',
        r: 'pg',
        d: 'mm'
      });

      //creating the instance of User
      user = new User({ name, email, password, avatar });

      //Creating salt using bcrypt
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);

      await user.save();

      //JWT payload = decoded value while the user gets verified.
      //user.id is the objectId which was saved inside the database.
      const payload = {
        user: { id: user.id }
      };

      //creating JWT Token and returning the token
      jwt.sign(payload, config.get('jwtSecret'), { expiresIn: 360000 }, (err, token) => {
        if (err) throw err;
        res.json({ token });
      });
    } catch (error) {
      console.log(error);
      res.status(500).send('server error');
    }
  }
);

module.exports = router;

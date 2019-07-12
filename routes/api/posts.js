const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const User = require('../../models/User');
const Profile = require('../../models/Profile');

// @route   POST api/posts
// @desc    Create a Post
// @access  Private
router.post(
  '/',
  [
    auth,
    [
      check('text', 'text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();
      res.json(post);
    } catch (error) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  }
);

// @route   GET api/posts
// @desc    get all Post
// @access  Private
router.get('/', auth, async (req, res) => {
  try {
    const post = await Post.find().sort({ date: -1 });
    res.json(post);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/posts/:id
// @desc    get all Posts by ID
// @access  Private
router.get('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.json(post);
  } catch (error) {
    console.log(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/:id
// @desc    delete a Post by ID
// @access  Private
router.delete('/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ msg: 'Post not found' });
    }

    //check on the user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    await post.remove();
    res.json({ msg: 'post removed' });
  } catch (error) {
    console.log(error);
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Post not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/posts/like/:id
// @desc    update likes array
// @access  Private

router.put('/likes/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    //console.log(post);
    //Checks if the post is already been liked.
    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
      return res.status(401).json({ msg: 'Post has been already liked' });
    }
    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/posts/unlike/:id
// @desc    delete a like by ID
// @access  Private
router.delete('/unlikes/:id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
      return res.status(401).json({ msg: 'Post has not yet liked' });
    }

    const removeIndex = post.likes.map(like => like.user.toString()).indexOf(req.user.id);

    post.likes.splice(removeIndex, 1); 
    await post.save();
    res.json(post.likes);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/posts/comment/:id
// @desc    Add comment docu to comments array in post model
// @access  Private
router.post(
  '/comment/:id',
  [
    auth,
    [
      check('text', 'text is required')
        .not()
        .isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).send({ errors: errors.array() });
    }
    try {
      const user = await User.findById(req.user.id).select('-password');
      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();
      res.json(post.comments);
    } catch (error) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  }
);

// @route   DELETE api/posts/comment/:post_id/:comment_id
// @desc    removes comment from the array of comments
// @access  Private
router.delete('/comment/:post_id/:comment_id', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.post_id);

    //pull out the comments
    const comment = post.comments.find(comment => comment.id === req.params.comment_id);

    //make sure comments exists.
    if (!comment) {
      return res.status(404).json({ msg: "comments doesn't exists" });
    }

    //Check user
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'User not authorized' });
    }

    const removeIndex = post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

    post.comments.splice(removeIndex, 1);
    await post.save();
    res.json(post.comments);
  } catch (error) {
    console.log(error);
    res.status(500).send('Server Error');
  }
});

module.exports = router;

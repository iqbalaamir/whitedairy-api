const router = require("express").Router()
const User = require('../models/User')
const Post = require('../models/Post')
const bcrypt = require("bcrypt")
const jwt = require('jsonwebtoken');

// Middleware function to authenticate JWT token
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    jwt.verify(token, 'my_secret_key', (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Forbidden' });
        }

        req.user = user;
        next();
    });
};



// Update user by ID
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Hash the password before storing it in the database
        const hashedPassword = await bcrypt.hash(password, 10);

        const updatedUser = await User.findByIdAndUpdate(
            req.params.id,
            {
                name,
                email,
                password: hashedPassword
            },
            {
                new: true,
                runValidators: true
            }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user: updatedUser });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


// Delete user by ID
router.delete('/:id', authenticateToken, async (req, res) => {
    try {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
  
      if (!deletedUser) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      // Delete all posts associated with the user
      await Post.deleteMany({ username: deletedUser.username });
  
      res.status(200).json({ message: 'User and associated posts deleted successfully' });
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  
//   GetUser

router.get('/:id', authenticateToken, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      const {password , ...others} = user._doc
      res.status(200).json({ others });
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

module.exports = router
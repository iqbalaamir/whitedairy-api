const express = require('express');
const router = express.Router();
const Post = require('../models/Post');
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const fs = require('fs');


const authenticateToken = (req, res, next) => {
    const token = req.headers['authorization'];
    // const token = authHeader && authHeader.split(' ')[1];

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


// CREATE
router.post('/',authenticateToken, async (req, res) => {
    try {
        const { title, desc, category } = req.body;
        console.log(req.user,"user")
        
        console.log(req.files)
        const photo = req.files ? req.files.photo[0].filename : '';
        console.log(photo)
        // const post = new Post({ title, desc, photo, username, category });
        const post = new Post({ title:title, desc:desc, photo:photo, username:req.user.id, category:category });

        const savedPost = await post.save();

        res.status(201).json({ post: savedPost });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

// UPDATE
// update a post with a new photo
router.patch('/:id', authenticateToken, async (req, res) => {
    try {
        
        const post = await Post.findById(req.params.id);
        
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        if (req.user.id !== post.username) {
            return res.status(401).json({ message: 'You are not authorized to update this post' });
        }
        console.log(Object.keys(req.files).length,'bodyy')

        if (Object.keys(req.files).length!==0 && req.files.photo.length!==0) {
            // if a new photo is uploaded, delete the old one first
            if (post.photo) {
                fs.unlinkSync(path.join(__dirname, 'public/uploads', post.photo));
            }
            // update the post with the new photo path
            post.photo = req.files.photo[0].filename;
        }
        // update other fields of the post
        post.title = !req.body.title?post.title:req.body.title;
        post.desc = !req.body.desc?post.desc:req.body.desc;
        post.category = !req.body.category?post.category:req.body.category;

        // save the updated post to the database
        const updatedPost = await post.save();

        res.status(200).send({ post: updatedPost });
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});

//Get All Post

router.get('/', async (req, res) => {
    try {
      let query = [];
  

      if (req.query.categories) {
        query['categories'] = 
        query.categories = req.query.categories;
      }
  
      if (req.query.username) {
        query.username = req.query.username;
      }
  
    //   const posts = await Post.find(query).populate('category', 'name'); // populate category field with only name field
    const posts = await Post.find({ 
        $or: [
          { category: { $in: [query.categories] } },
          { username: query.username }
        ]
      })
      res.status(200).json(posts);
    } catch (err) {
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  

//   Get Post By Id
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id).populate('category', 'name'); // populate category field with only name field

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(post);
    } catch (err) {
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


module.exports = router

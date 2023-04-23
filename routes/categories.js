const router = require('express').Router();
const Category = require('../models/Category');
const  authenticateToken  = require('../middlewares/auth');

// Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.find();

    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Create a new category
router.post('/', authenticateToken, async (req, res) => {
  try {
    const category = new Category({
      name: req.body.name
    });
    console.log(req.body)
    const newCategory = await category.save();

    res.status(201).send(newCategory);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Get a category by id
router.get('/:id', async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json(category);
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Update a category by id
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const updatedCategory = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!updatedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ category: updatedCategory });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

// Delete a category by id
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const deletedCategory = await Category.findByIdAndDelete(req.params.id);

    if (!deletedCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.status(200).json({ message: 'Category deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Internal Server Error' });
  }
});

module.exports = router;

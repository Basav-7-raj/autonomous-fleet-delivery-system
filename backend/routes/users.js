const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// Register a new user
router.post('/register', async (req, res) => {
  console.log('Received registration request. Request Body:', req.body);
  try {
    const { email } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send({ message: 'Email already registered.' });
    }

    const user = new User(req.body);
    await user.save();

    const token = user.generateAuthToken();
    res.status(201).send({ user, token });

  } catch (error) {
    console.error('Registration Error Details:', error);
    // More detailed error handling
    if (error.name === 'ValidationError') {
      const errors = Object.keys(error.errors).map(key => error.errors[key].message);
      return res.status(400).send({ message: errors.join(', ') });
    } else if (error.code === 11000) { // Duplicate key error
      return res.status(400).send({ message: 'A user with this username or email already exists.' });
    }
    // Send the specific error message if available, otherwise the generic one
    res.status(400).send({ message: error.message || 'Registration failed. Please try again.' });
  }
});

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).send({ message: 'Email and password are required.' });
    }

    const user = await User.findByCredentials(email, password);
    const token = user.generateAuthToken();

    res.send({ user, token });

  } catch (error) {
    res.status(400).send({ message: 'Invalid login credentials.' });
  }
});

// Get current user's profile
router.get('/me', auth, async (req, res) => {
  res.send(req.user);
});

// Update profile
router.patch('/me', auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ['name', 'email', 'password', 'phone', 'isActive'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation) {
    return res.status(400).send({ error: 'Invalid updates!' });
  }

  if (updates.length === 0) {
    return res.status(400).send({ error: 'No fields provided to update.' });
  }

  try {
    updates.forEach((update) => (req.user[update] = req.body[update]));
    await req.user.save();
    res.send(req.user);
  } catch (error) {
    res.status(400).send({ message: 'Update failed. Please try again.' });
  }
});

// Delete own account
router.delete('/me', auth, async (req, res) => {
  try {
    await req.user.remove();
    res.send({ message: 'Account deleted successfully.', user: req.user });
  } catch (error) {
    res.status(500).send({ message: 'Deletion failed. Try again later.' });
  }
});

// Admin: Get all users
router.get('/', auth, async (req, res) => {
  // Allow fetching drivers for any authenticated user
  if (req.query.role === 'driver') {
    try {
      const drivers = await User.find({ role: 'driver' });
      return res.json(drivers);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch drivers.' });
    }
  }

  // Allow fetching mechanics for any authenticated user
  if (req.query.role === 'mechanic') {
    try {
      const mechanics = await User.find({ role: 'mechanic' });
      return res.json(mechanics);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch mechanics.' });
    }
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  try {
    const users = await User.find({});
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch users.' });
  }
});

// Admin: Get user by ID
router.get('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied.' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch user' });
  }
});

// Admin: Update user by ID
router.patch('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const updates = Object.keys(req.body);
  const allowedUpdates = ['username', 'email', 'password', 'role', 'name', 'phone', 'isActive'];
  const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

  if (!isValidOperation || updates.length === 0) {
    return res.status(400).send({ error: 'Invalid or empty updates!' });
  }

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();
    res.send(user);
  } catch (error) {
    res.status(400).send({ message: 'Failed to update user' });
  }
});

// Admin: Delete user by ID
router.delete('/:id', auth, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.send({ message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete user' });
  }
});

module.exports = router;

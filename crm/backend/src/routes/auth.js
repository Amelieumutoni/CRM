const router = require('express').Router();
const jwt    = require('jsonwebtoken');
const async  = require('../middleware/asyncHandler');
const User   = require('../models/User');

// Register (only used once to create accounts)
router.post('/register', async(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: 'Name, email and password required' });

  const exists = await User.findOne({ email });
  if (exists) return res.status(400).json({ error: 'Email already registered' });

  const user  = await User.create({ name, email, password });
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    token,
    user: { _id: user._id, name: user.name, email: user.email }
  });
}));

// Login
router.post('/login', async(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password required' });

  const user = await User.findOne({ email });
  if (!user || !(await user.matchPassword(password)))
    return res.status(401).json({ error: 'Invalid email or password' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

  res.json({
    token,
    user: { _id: user._id, name: user.name, email: user.email }
  });
}));

// Get current logged in user
router.get('/me', async(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'No token' });
  const decoded = jwt.verify(token, process.env.JWT_SECRET);
  const user = await User.findById(decoded.id).select('-password');
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
}));

module.exports = router;
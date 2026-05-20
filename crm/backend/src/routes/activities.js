const router   = require('express').Router();
const async    = require('../middleware/asyncHandler');
const Activity = require('../models/Activity');

// List all activities
router.get('/', async(async (_req, res) => {
  const acts = await Activity.find()
    .populate('companyId', 'name')
    .populate('contactId', 'firstName lastName')
    .populate('dealId',    'title')
    .sort({ date: -1 })
    .lean();
  res.json(acts);
}));

// Create
router.post('/', async(async (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'Title is required' });
  const activity = await Activity.create(req.body);
  res.status(201).json(activity);
}));

// Update
router.put('/:id', async(async (req, res) => {
  const activity = await Activity.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!activity) return res.status(404).json({ error: 'Activity not found' });
  res.json(activity);
}));

// Toggle completed
router.patch('/:id/toggle', async(async (req, res) => {
  const activity = await Activity.findById(req.params.id);
  if (!activity) return res.status(404).json({ error: 'Activity not found' });
  activity.completed = !activity.completed;
  await activity.save();
  res.json(activity);
}));

// Delete
router.delete('/:id', async(async (req, res) => {
  const activity = await Activity.findByIdAndDelete(req.params.id);
  if (!activity) return res.status(404).json({ error: 'Activity not found' });
  res.json({ success: true });
}));

module.exports = router;

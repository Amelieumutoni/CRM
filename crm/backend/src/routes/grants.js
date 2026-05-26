const router = require('express').Router();
const async  = require('../middleware/asyncHandler');
const Grant  = require('../models/Grant');

const STAGES = ['Identifying','Drafting','Submitted','Under Review','Approved','Rejected'];

// List all grants
router.get('/', async(async (_req, res) => {
  const grants = await Grant.find()
    .populate('contactId', 'firstName lastName')
    .sort({ createdAt: -1 })
    .lean();
  res.json(grants);
}));

// Stats
router.get('/stats', async(async (_req, res) => {
  const grants   = await Grant.find().lean();
  const approved = grants.filter(g => g.stage === 'Approved');
  const active   = grants.filter(g => !['Approved','Rejected'].includes(g.stage));
  res.json({
    total:        grants.length,
    totalAmount:  grants.reduce((s, g) => s + (g.amount || 0), 0),
    approvedAmount: approved.reduce((s, g) => s + (g.amount || 0), 0),
    approvedCount: approved.length,
    activeCount:  active.length,
    successRate:  grants.length ? Math.round((approved.length / grants.length) * 100) : 0,
  });
}));

// Create
router.post('/', async(async (req, res) => {
  if (!req.body.name || !req.body.funder)
    return res.status(400).json({ error: 'Name and funder are required' });
  const grant = await Grant.create(req.body);
  res.status(201).json(grant);
}));

// Update
router.put('/:id', async(async (req, res) => {
  const grant = await Grant.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!grant) return res.status(404).json({ error: 'Grant not found' });
  res.json(grant);
}));

// Delete
router.delete('/:id', async(async (req, res) => {
  const grant = await Grant.findByIdAndDelete(req.params.id);
  if (!grant) return res.status(404).json({ error: 'Grant not found' });
  res.json({ success: true });
}));

module.exports = router;
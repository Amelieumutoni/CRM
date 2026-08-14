const router   = require('express').Router();
const async    = require('../middleware/asyncHandler');
const Deal     = require('../models/Deal');
const Activity = require('../models/Activity');

// List all deals — optional ?stage=&q=
router.get('/', async(async (req, res) => {
  const { stage, q } = req.query;
  const filter = {};
  if (stage && stage !== 'All') filter.stage = stage;

  let deals = await Deal.find(filter)
    .populate('companyId', 'name industry website')
    .populate('contactId', 'firstName lastName title email phone')
    .sort({ createdAt: -1 })
    .lean();

  if (q) {
    const lq = q.toLowerCase();
    deals = deals.filter(d =>
      d.title.toLowerCase().includes(lq) ||
      (d.companyId?.name || '').toLowerCase().includes(lq)
    );
  }

  res.json(deals);
}));

// Get one deal with activities
router.get('/:id', async(async (req, res) => {
  const deal = await Deal.findById(req.params.id)
    .populate('companyId', 'name industry website')
    .populate('contactId', 'firstName lastName title email phone')
    .lean();
  if (!deal) return res.status(404).json({ error: 'Deal not found' });

  deal.activities = await Activity.find({ dealId: deal._id })
    .populate('contactId', 'firstName lastName')
    .sort({ date: -1 })
    .lean();

  res.json(deal);
}));

// Create
router.post('/', async(async (req, res) => {
  if (!req.body.title) return res.status(400).json({ error: 'Title is required' });
  const deal = await Deal.create(req.body);
  res.status(201).json(deal);
}));

// Update (also used for stage moves)
router.put('/:id', async(async (req, res) => {
  const deal = await Deal.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  res.json(deal);
}));

// Upload quotation
router.post('/:id/quotation', async(async (req, res) => {
  const { fileName, fileData, fileType, uploadedBy } = req.body;
  if (!fileData) return res.status(400).json({ error: 'No file data provided' });
  if (fileData.length > 7 * 1024 * 1024)
    return res.status(400).json({ error: 'File too large. Maximum size is 5MB' });
  const deal = await Deal.findByIdAndUpdate(
    req.params.id,
    { quotation: { fileName, fileData, fileType, uploadedBy, uploadedAt: new Date() } },
    { new: true }
  );
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  res.json({ success: true, fileName, uploadedAt: deal.quotation.uploadedAt });
}));

// Remove quotation
router.delete('/:id/quotation', async(async (req, res) => {
  const deal = await Deal.findByIdAndUpdate(
    req.params.id,
    { quotation: { fileName:'', fileData:'', fileType:'', uploadedBy:'', uploadedAt: null } },
    { new: true }
  );
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  res.json({ success: true });
}));

// Delete (cascade activities)
router.delete('/:id', async(async (req, res) => {
  const deal = await Deal.findByIdAndDelete(req.params.id);
  if (!deal) return res.status(404).json({ error: 'Deal not found' });
  await Activity.deleteMany({ dealId: req.params.id });
  res.json({ success: true });
}));

module.exports = router;
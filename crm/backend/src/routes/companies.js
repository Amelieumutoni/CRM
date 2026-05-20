const router      = require('express').Router();
const async       = require('../middleware/asyncHandler');
const Company     = require('../models/Company');
const Contact     = require('../models/Contact');
const Deal        = require('../models/Deal');
const Activity    = require('../models/Activity');

// List all companies with aggregated counts
router.get('/', async(async (_req, res) => {
  const companies = await Company.find().sort({ name: 1 }).lean();

  const enriched = await Promise.all(companies.map(async (c) => {
    const [contactCount, deals] = await Promise.all([
      Contact.countDocuments({ companyId: c._id }),
      Deal.find({ companyId: c._id }).lean(),
    ]);
    const openDeals    = deals.filter(d => !['Closed Won','Closed Lost'].includes(d.stage));
    const pipelineValue = openDeals.reduce((s, d) => s + (d.value || 0), 0);
    return { ...c, contactCount, dealCount: deals.length, pipelineValue };
  }));

  res.json(enriched);
}));

// Get one company — full detail
router.get('/:id', async(async (req, res) => {
  const company = await Company.findById(req.params.id).lean();
  if (!company) return res.status(404).json({ error: 'Company not found' });

  const [contacts, deals, activities] = await Promise.all([
    Contact.find({ companyId: company._id }).sort({ isPrimary: -1, firstName: 1 }).lean(),
    Deal.find({ companyId: company._id }).sort({ createdAt: -1 }).lean(),
    Activity.find({ companyId: company._id })
      .populate('contactId', 'firstName lastName')
      .populate('dealId', 'title')
      .sort({ date: -1 })
      .lean(),
  ]);

  res.json({ ...company, contacts, deals, activities });
}));

// Create
router.post('/', async(async (req, res) => {
  const { name, industry, size, website, status, notes } = req.body;
  if (!name) return res.status(400).json({ error: 'Name is required' });
  const company = await Company.create({ name, industry, size, website, status, notes });
  res.status(201).json(company);
}));

// Update
router.put('/:id', async(async (req, res) => {
  const company = await Company.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json(company);
}));

// Delete
router.delete('/:id', async(async (req, res) => {
  const company = await Company.findByIdAndDelete(req.params.id);
  if (!company) return res.status(404).json({ error: 'Company not found' });
  res.json({ success: true });
}));

module.exports = router;

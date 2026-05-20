const router  = require('express').Router();
const async   = require('../middleware/asyncHandler');
const Contact = require('../models/Contact');
const Company = require('../models/Company');

// List all contacts
router.get('/', async(async (_req, res) => {
  const contacts = await Contact.find().sort({ firstName: 1, lastName: 1 }).lean();
  const companyIds = [...new Set(contacts.map(c => c.companyId?.toString()).filter(Boolean))];
  const companies  = await Company.find({ _id: { $in: companyIds } }).lean();
  const coMap = Object.fromEntries(companies.map(c => [c._id.toString(), c.name]));
  res.json(contacts.map(c => ({ ...c, companyName: coMap[c.companyId?.toString()] || '' })));
}));

// Create
router.post('/', async(async (req, res) => {
  const { firstName, lastName } = req.body;
  if (!firstName || !lastName) return res.status(400).json({ error: 'First and last name required' });
  const contact = await Contact.create(req.body);
  res.status(201).json(contact);
}));

// Update
router.put('/:id', async(async (req, res) => {
  const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json(contact);
}));

// Delete
router.delete('/:id', async(async (req, res) => {
  const contact = await Contact.findByIdAndDelete(req.params.id);
  if (!contact) return res.status(404).json({ error: 'Contact not found' });
  res.json({ success: true });
}));

module.exports = router;

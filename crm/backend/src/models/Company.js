const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  name:      { type: String, required: true, trim: true },
  industry:  { type: String, default: 'SaaS' },
  size:      { type: String, default: '50-200' },
  website:   { type: String, default: '' },
  status:    { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  notes:     { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);

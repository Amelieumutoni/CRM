const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  companyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  firstName:  { type: String, required: true, trim: true },
  lastName:   { type: String, required: true, trim: true },
  title:      { type: String, default: '' },
  email:      { type: String, default: '' },
  phone:      { type: String, default: '' },
  linkedin:   { type: String, default: '' },
  isPrimary:  { type: Boolean, default: false },
  institution: { type: String, default: '' },
  owner:      { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);

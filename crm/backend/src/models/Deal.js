const mongoose = require('mongoose');


const STAGES = ['Prospecting','Qualified','Quotation','Demo','Proposal','Negotiation','Closed Won','Closed Lost'];
const dealSchema = new mongoose.Schema({
  title:       { type: String, required: true, trim: true },
  companyId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  contactId:   { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  value:       { type: Number, default: 0 },
  stage:       { type: String, enum: STAGES, default: 'Prospecting' },
  probability: { type: Number, default: 20, min: 0, max: 100 },
  closeDate:   { type: Date, default: null },
  priority:    { type: String, enum: ['High','Medium','Low'], default: 'Medium' },
  notes:       { type: String, default: '' },
  quotation:   {
    fileName:  { type: String, default: '' },
    fileData:  { type: String, default: '' }, // base64
    fileType:  { type: String, default: '' },
    uploadedBy: { type: String, default: '' },
    uploadedAt: { type: Date, default: null },
  },
  owner:       { type: String, default: 'me' },
}, { timestamps: true });

module.exports = mongoose.model('Deal', dealSchema);

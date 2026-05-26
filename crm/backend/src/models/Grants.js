const mongoose = require('mongoose');

const STAGES = ['Identifying','Drafting','Submitted','Under Review','Approved','Rejected'];

const grantSchema = new mongoose.Schema({
  name:             { type: String, required: true, trim: true },
  funder:           { type: String, required: true, trim: true },
  amount:           { type: Number, default: 0 },
  stage:            { type: String, enum: STAGES, default: 'Identifying' },
  deadline:         { type: Date, default: null },
  decisionDate:     { type: Date, default: null },
  contactId:        { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  notes:            { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Grant', grantSchema);
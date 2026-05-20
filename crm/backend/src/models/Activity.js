const mongoose = require('mongoose');

const TYPES = ['Call','Email','Meeting','Demo','Follow-up','Note'];

const activitySchema = new mongoose.Schema({
  dealId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Deal',    default: null },
  companyId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Company', default: null },
  contactId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Contact', default: null },
  type:       { type: String, enum: TYPES, default: 'Call' },
  title:      { type: String, required: true, trim: true },
  notes:      { type: String, default: '' },
  date:       { type: Date, default: Date.now },
  completed:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);

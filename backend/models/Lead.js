const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdByName: { type: String },
}, { timestamps: true });

const followUpSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  note: { type: String },
  completed: { type: Boolean, default: false },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
}, { timestamps: true });

const leadSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true },
  phone: { type: String, trim: true, default: '' },
  company: { type: String, trim: true, default: '' },
  source: {
    type: String,
    enum: ['Website', 'LinkedIn', 'Referral', 'Cold Call', 'Email Campaign', 'Social Media', 'Trade Show', 'Other'],
    default: 'Website'
  },
  status: {
    type: String,
    enum: ['New', 'Contacted', 'Qualified', 'Proposal', 'Negotiation', 'Converted', 'Lost'],
    default: 'New'
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Urgent'],
    default: 'Medium'
  },
  value: { type: Number, default: 0 },
  tags: [{ type: String, trim: true }],
  notes: [noteSchema],
  followUps: [followUpSchema],
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  assignedToName: { type: String, default: '' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastContact: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);

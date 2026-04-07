const mongoose = require('mongoose');

const noteSchema = new mongoose.Schema({
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const leadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  source: {
    type: String,
    enum: ['Website', 'Referral', 'Social Media', 'Email', 'Cold Call', 'Other'],
    default: 'Website'
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'converted', 'lost'],
    default: 'new'
  },
  notes: [noteSchema],
  company: {
    type: String,
    trim: true
  },
  message: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);

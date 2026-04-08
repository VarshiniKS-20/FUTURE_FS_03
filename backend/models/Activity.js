const mongoose = require('mongoose');

const activitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['lead_created', 'status_changed', 'note_added', 'followup_added', 'lead_updated', 'lead_deleted'],
    required: true
  },
  message: { type: String, required: true },
  leadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lead' },
  leadName: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String },
  meta: { type: Object, default: {} },
}, { timestamps: true });

module.exports = mongoose.model('Activity', activitySchema);

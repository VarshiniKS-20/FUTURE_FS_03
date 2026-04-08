const express = require('express');
const Lead = require('../models/Lead');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();

const logActivity = async (type, message, leadId, leadName, userId, userName, meta = {}) => {
  try {
    await Activity.create({ type, message, leadId, leadName, userId, userName, meta });
  } catch (e) { console.error('Activity log error:', e.message); }
};

// Get all leads with filters
router.get('/', protect, async (req, res) => {
  try {
    const { status, source, priority, search, page = 1, limit = 20, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;
    if (source && source !== 'All') query.source = source;
    if (priority && priority !== 'All') query.priority = priority;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }
    const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [leads, total] = await Promise.all([
      Lead.find(query).sort(sort).skip(skip).limit(parseInt(limit)),
      Lead.countDocuments(query)
    ]);
    res.json({ leads, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Create lead
router.post('/', protect, async (req, res) => {
  try {
    const lead = await Lead.create({ ...req.body, createdBy: req.user._id });
    await logActivity('lead_created', `New lead "${lead.name}" was created`, lead._id, lead.name, req.user._id, req.user.name);
    res.status(201).json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Get single lead
router.get('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Update lead
router.put('/:id', protect, async (req, res) => {
  try {
    const oldLead = await Lead.findById(req.params.id);
    if (!oldLead) return res.status(404).json({ message: 'Lead not found' });
    const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (oldLead.status !== lead.status) {
      await logActivity('status_changed', `"${lead.name}" status changed from ${oldLead.status} to ${lead.status}`, lead._id, lead.name, req.user._id, req.user.name, { from: oldLead.status, to: lead.status });
    } else {
      await logActivity('lead_updated', `Lead "${lead.name}" was updated`, lead._id, lead.name, req.user._id, req.user.name);
    }
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Delete lead
router.delete('/:id', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    await Lead.findByIdAndDelete(req.params.id);
    await logActivity('lead_deleted', `Lead "${lead.name}" was deleted`, null, lead.name, req.user._id, req.user.name);
    res.json({ message: 'Lead deleted successfully' });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add note
router.post('/:id/notes', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.notes.unshift({ text: req.body.text, createdBy: req.user._id, createdByName: req.user.name });
    await lead.save();
    await logActivity('note_added', `Note added to "${lead.name}"`, lead._id, lead.name, req.user._id, req.user.name);
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Add follow-up
router.post('/:id/followups', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    lead.followUps.push({ ...req.body, createdBy: req.user._id });
    await lead.save();
    await logActivity('followup_added', `Follow-up scheduled for "${lead.name}"`, lead._id, lead.name, req.user._id, req.user.name);
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Toggle follow-up complete
router.patch('/:id/followups/:fid', protect, async (req, res) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) return res.status(404).json({ message: 'Lead not found' });
    const fu = lead.followUps.id(req.params.fid);
    if (!fu) return res.status(404).json({ message: 'Follow-up not found' });
    fu.completed = !fu.completed;
    await lead.save();
    res.json(lead);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

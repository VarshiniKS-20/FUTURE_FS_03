const express = require('express');
const Lead = require('../models/Lead');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/stats', protect, async (req, res) => {
  try {
    const [
      totalLeads, newLeads, contactedLeads, convertedLeads, lostLeads,
      highPriority, totalValue, bySource, byStatus, recentLeads, upcomingFollowUps
    ] = await Promise.all([
      Lead.countDocuments(),
      Lead.countDocuments({ status: 'New' }),
      Lead.countDocuments({ status: 'Contacted' }),
      Lead.countDocuments({ status: 'Converted' }),
      Lead.countDocuments({ status: 'Lost' }),
      Lead.countDocuments({ priority: { $in: ['High', 'Urgent'] } }),
      Lead.aggregate([{ $group: { _id: null, total: { $sum: '$value' } } }]),
      Lead.aggregate([{ $group: { _id: '$source', count: { $sum: 1 } } }]),
      Lead.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Lead.find().sort({ createdAt: -1 }).limit(5).select('name email status priority createdAt'),
      Lead.find({
        'followUps.completed': false,
        'followUps.date': { $gte: new Date(), $lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }
      }).select('name followUps').limit(5)
    ]);

    const conversionRate = totalLeads > 0 ? ((convertedLeads / totalLeads) * 100).toFixed(1) : 0;

    res.json({
      totalLeads, newLeads, contactedLeads, convertedLeads, lostLeads,
      highPriority, conversionRate,
      totalValue: totalValue[0]?.total || 0,
      bySource, byStatus, recentLeads, upcomingFollowUps
    });
  } catch (err) { res.status(500).json({ message: err.message }); }
});

// Monthly trend (last 6 months)
router.get('/trends', protect, async (req, res) => {
  try {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5);
    sixMonthsAgo.setDate(1);
    const trends = await Lead.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      { $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
        converted: { $sum: { $cond: [{ $eq: ['$status', 'Converted'] }, 1, 0] } },
        value: { $sum: '$value' }
      }},
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    res.json(trends);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

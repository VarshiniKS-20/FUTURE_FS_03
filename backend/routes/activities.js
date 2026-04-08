const express = require('express');
const Activity = require('../models/Activity');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const activities = await Activity.find().sort({ createdAt: -1 }).limit(parseInt(limit));
    res.json(activities);
  } catch (err) { res.status(500).json({ message: err.message }); }
});

module.exports = router;

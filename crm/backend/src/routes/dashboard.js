const router   = require('express').Router();
const async    = require('../middleware/asyncHandler');
const Deal     = require('../models/Deal');
const Activity = require('../models/Activity');

// Summary stats
router.get('/stats', async(async (_req, res) => {
  const deals = await Deal.find().lean();

  const openDeals   = deals.filter(d => !['Closed Won','Closed Lost'].includes(d.stage));
  const wonDeals    = deals.filter(d => d.stage === 'Closed Won');

  const pipelineValue  = openDeals.reduce((s, d) => s + d.value, 0);
  const weightedValue  = openDeals.reduce((s, d) => s + d.value * d.probability / 100, 0);
  const wonValue       = wonDeals.reduce((s, d) => s + d.value, 0);

  // Group open deals by stage
  const stageMap = {};
  for (const d of openDeals) {
    if (!stageMap[d.stage]) stageMap[d.stage] = { stage: d.stage, count: 0, value: 0 };
    stageMap[d.stage].count++;
    stageMap[d.stage].value += d.value;
  }
  const byStage = Object.values(stageMap);

  const overdueCount = await Activity.countDocuments({
    completed: false,
    date: { $lt: new Date() },
  });

  res.json({
    totalDeals:    deals.length,
    openDeals:     openDeals.length,
    pipelineValue,
    weightedValue,
    wonValue,
    wonDeals:      wonDeals.length,
    overdueCount,
    byStage,
  });
}));

// Upcoming tasks
router.get('/upcoming', async(async (_req, res) => {
  const activities = await Activity.find({ completed: false })
    .populate('companyId', 'name')
    .populate('contactId', 'firstName lastName')
    .populate('dealId',    'title')
    .sort({ date: 1 })
    .limit(20)
    .lean();
  res.json(activities);
}));

module.exports = router;

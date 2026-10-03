import express from 'express';
import Trade from '../models/Trade.js';
import OutcomeStat from '../models/OutcomeStat.js';
import Provider from '../models/Provider.js';
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const query = {};
    if (req.query.sector) query.sector = req.query.sector;
    if (req.query.q) query.$or = [
      { name: { $regex: req.query.q, $options: 'i' } },
      { sector: { $regex: req.query.q, $options: 'i' } },
    ];
    const trades = await Trade.find(query).sort({ name: 1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const isObjectId = /^[a-f\d]{24}$/i.test(req.params.id);
    const trade = isObjectId
      ? await Trade.findById(req.params.id)
      : await Trade.findOne({ tradeId: req.params.id });
    if (!trade) return res.status(404).json({ message: 'Trade not found' });

    const district = req.query.district;
    const districtStats = district
      ? await OutcomeStat.find({ tradeId: trade.tradeId, district }).sort({ year: -1 })
      : [];
    const stateStats = districtStats.length
      ? districtStats
      : await OutcomeStat.find({ tradeId: trade.tradeId }).sort({ year: -1 });
    const latestYear = stateStats[0]?.year;
    const statsForYear = stateStats.filter((stat) => stat.year === latestYear);
    const totalBatch = statsForYear.reduce((sum, stat) => sum + (stat.batchSize || 0), 0);
    const weighted = (field) => totalBatch
      ? statsForYear.reduce((sum, stat) => sum + (stat[field] || 0) * (stat.batchSize || 0), 0) / totalBatch
      : null;
    const providers = await Provider.find({
      district: district || statsForYear[0]?.district,
      tradesOffered: trade.tradeId,
    });

    res.json({
      trade,
      outcomes: statsForYear,
      aggregate: statsForYear.length ? {
        year: latestYear,
        scope: districtStats.length ? 'district' : 'state',
        placementRatePct: weighted('placementRatePct'),
        avgStartingSalaryMonthly: weighted('avgStartingSalaryMonthly'),
        avgSalaryAfter3YrsMonthly: weighted('avgSalaryAfter3YrsMonthly'),
        batchSize: totalBatch,
        source: statsForYear[0].source,
      } : null,
      fallback: districtStats.length ? null : 'state',
      providers,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;

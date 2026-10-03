import express from 'express';
import multer from 'multer';
import csv from 'csv-parser';
import { Readable } from 'node:stream';
import OutcomeStat from '../models/OutcomeStat.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

router.get('/', async (req, res) => {
  try {
    const { tradeId, district, state } = req.query;
    const query = {};
    if (tradeId) query.tradeId = tradeId;
    if (district) query.district = district;
    if (state) query.state = state;
    const outcomes = await OutcomeStat.find(query).sort({ year: -1, district: 1 });
    res.json(outcomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/trade/:tradeId', async (req, res) => {
  try {
    const outcomes = await OutcomeStat.find({ tradeId: req.params.tradeId }).sort({ year: -1 });
    res.json(outcomes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/upload', protect, requireRole('admin'), upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'No CSV file uploaded' });

  try {
    const rows = [];
    await new Promise((resolve, reject) => {
      Readable.from(req.file.buffer)
        .pipe(csv())
        .on('data', (row) => rows.push(row))
        .on('end', resolve)
        .on('error', reject);
    });

    const datasetVersion = req.body.datasetVersion || `upload-${Date.now()}`;
    const validRows = [];
    const rejected = [];
    const required = ['trade_id', 'district', 'year', 'batch_size', 'placement_rate_pct', 'source'];
    const numberFields = ['year', 'batch_size', 'placement_rate_pct', 'avg_starting_salary_monthly', 'salary_min', 'salary_max', 'avg_salary_after_3yrs_monthly', 'self_employed_pct', 'higher_study_pct'];

    rows.forEach((row, index) => {
      const missing = required.filter((field) => !String(row[field] ?? '').trim());
      if (missing.length) {
        rejected.push({ row: index + 2, reason: 'missing_required_fields', fields: missing });
        return;
      }

      const values = Object.fromEntries(numberFields.map((field) => [field, row[field] === '' || row[field] === undefined ? undefined : Number(row[field])]));
      const invalidNumber = numberFields.find((field) => values[field] !== undefined && !Number.isFinite(values[field]));
      const invalidRange = values.placement_rate_pct !== undefined && (values.placement_rate_pct < 0 || values.placement_rate_pct > 100);
      if (invalidNumber || invalidRange || values.batch_size < 0) {
        rejected.push({ row: index + 2, reason: invalidNumber ? `invalid_number:${invalidNumber}` : 'numeric_value_out_of_range' });
        return;
      }

      validRows.push({
        tradeId: row.trade_id,
        providerId: row.provider_id || null,
        district: row.district,
        state: row.state || 'Maharashtra',
        year: values.year,
        batchSize: values.batch_size,
        placementRatePct: values.placement_rate_pct,
        avgStartingSalaryMonthly: values.avg_starting_salary_monthly,
        salaryMin: values.salary_min,
        salaryMax: values.salary_max,
        avgSalaryAfter3YrsMonthly: values.avg_salary_after_3yrs_monthly,
        selfEmployedPct: values.self_employed_pct,
        higherStudyPct: values.higher_study_pct,
        source: row.source,
        verified: row.verified === 'true',
        datasetVersion,
      });
    });

    if (validRows.length) await OutcomeStat.insertMany(validRows);
    res.json({ datasetVersion, received: rows.length, inserted: validRows.length, rejected: rejected.length, rejectedRows: rejected });
  } catch (error) {
    res.status(400).json({ message: 'Outcome CSV processing failed', error: error.message });
  }
});

export default router;

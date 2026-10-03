import mongoose from 'mongoose';

const outcomeStatSchema = new mongoose.Schema(
    {
        tradeId: { type: String, required: true, index: true },
        providerId: { type: String, default: null, index: true },
        district: { type: String, required: true, index: true },
        state: { type: String, default: 'Maharashtra' },
        year: { type: Number, required: true },
        batchSize: { type: Number, min: 0 },
        placementRatePct: { type: Number, min: 0, max: 100 },
        avgStartingSalaryMonthly: { type: Number, min: 0 },
        salaryMin: { type: Number, min: 0 },
        salaryMax: { type: Number, min: 0 },
        avgSalaryAfter3YrsMonthly: { type: Number, min: 0 },
        selfEmployedPct: { type: Number, min: 0, max: 100 },
        higherStudyPct: { type: Number, min: 0, max: 100 },
        source: { type: String, required: true },
        verified: { type: Boolean, default: false },
        datasetVersion: String,
    },
    { timestamps: true }
);

outcomeStatSchema.index({ tradeId: 1, district: 1, year: -1 });

export default mongoose.model('OutcomeStat', outcomeStatSchema);
import mongoose from 'mongoose';

const outcomeDataSchema = new mongoose.Schema(
  {
    tradeId: { type: mongoose.Schema.Types.ObjectId, ref: 'Trade', required: true },
    provider: { type: String },
    location: { type: String }, // e.g., "Maharashtra"
    placementRate: { type: Number }, // percentage
    earningsMin: { type: Number },
    earningsMax: { type: Number },
    sampleSize: { type: Number },
    source: { type: String }, // e.g., "Demo Dataset"
    lastUpdated: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model('OutcomeData', outcomeDataSchema);

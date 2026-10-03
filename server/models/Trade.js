import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema(
  {
    tradeId: { type: String, unique: true, sparse: true, index: true },
    name: { type: mongoose.Schema.Types.Mixed, required: true },
    sector: String,
    description: { type: String },
    eligibility: { type: String },
    duration: { type: String }, // e.g., "12 months"
    nsqfLevel: { type: Number },
    jobRoles: [{ type: String }],
    progression: { type: String }, // Optional, could be an array of steps
    durationMonths: Number,
    minEligibility: String,
    safetyNotes: mongoose.Schema.Types.Mixed,
    socialPerceptionNotes: mongoose.Schema.Types.Mixed,
    furtherEducation: mongoose.Schema.Types.Mixed,
  },
  { timestamps: true }
);

export default mongoose.model('Trade', tradeSchema);

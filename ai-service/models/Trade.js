import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String },
    eligibility: { type: String },
    duration: { type: String }, // e.g., "12 months"
    nsqfLevel: { type: Number },
    jobRoles: [{ type: String }],
    progression: { type: String }, // Optional, could be an array of steps
  },
  { timestamps: true }
);

export default mongoose.model('Trade', tradeSchema);

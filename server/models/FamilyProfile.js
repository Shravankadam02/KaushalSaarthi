import mongoose from 'mongoose';

const familyProfileSchema = new mongoose.Schema(
  {
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: String }], // e.g., ["Father", "Mother", "Guardian"]
    concerns: [{ type: String }], // Main concerns selected during counseling
    participation: { type: String, enum: ['learner', 'parent', 'both'], default: 'both' },
  },
  { timestamps: true }
);

export default mongoose.model('FamilyProfile', familyProfileSchema);

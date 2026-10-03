import mongoose from 'mongoose';

const noteSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    note: { type: String, required: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
  },
  { timestamps: true }
);

export default mongoose.model('Note', noteSchema);
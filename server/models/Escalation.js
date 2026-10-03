import mongoose from 'mongoose';

const escalationSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    mentorId: { type: String, default: null },
    reason: { type: String, required: true },
    summary: { type: String, default: '' },
    chatSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved'], default: 'open' },
    familyId: { type: String, default: null, index: true },
    objectionCategory: { type: String, default: 'other' },
    preferredContact: { type: String, enum: ['call', 'whatsapp', 'visit'], default: 'call' },
    phone: { type: String, default: null },
    preferredTime: { type: String, default: null },
    language: { type: String, enum: ['en', 'mr', 'hi'], default: 'en' },
    outcome: { type: String, enum: ['convinced', 'partially', 'not_convinced', 'no_response'], default: null },
    counsellorNotes: { type: String, default: '' },
    isSynthetic: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

export default mongoose.model('Escalation', escalationSchema);
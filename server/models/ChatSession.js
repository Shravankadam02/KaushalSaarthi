import mongoose from 'mongoose';

const chatSessionSchema = new mongoose.Schema(
    {
        studentId: { type: String, default: null, index: true },
        familyId: { type: String, default: null, index: true },
        status: { type: String, enum: ['active', 'escalated', 'resolved'], default: 'active' },
        language: { type: String, enum: ['en', 'mr', 'hi'], default: 'en' },
        tradeFocusId: { type: String, default: null },
        startSentiment: { type: Number, min: -1, max: 1, default: null },
        latestSentiment: { type: Number, min: -1, max: 1, default: null },
        finalFeeling: { type: String, enum: ['worried', 'neutral', 'hopeful'], default: null },
        escalated: { type: Boolean, default: false },
        district: { type: String, default: null },
        isSynthetic: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

export default mongoose.model('ChatSession', chatSessionSchema);
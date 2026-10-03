import mongoose from 'mongoose';

const chatMessageSchema = new mongoose.Schema(
    {
        chatSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true, index: true },
        role: { type: String, enum: ['user', 'ai', 'counsellor'], required: true },
        content: { type: String, required: true },
        speaker: { type: String, enum: ['parent', 'learner'], default: null },
        language: { type: String, enum: ['en', 'mr', 'hi'], default: 'en' },
        objectionCategory: { type: String, default: 'other' },
        sentiment: { type: Number, min: -1, max: 1, default: null },
        dataUsed: [{ statId: String, tradeId: String, district: String, year: Number }],
        lowConfidence: { type: Boolean, default: false },
        retrievedTopics: [String],
        isSynthetic: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('ChatMessage', chatMessageSchema);
import mongoose from 'mongoose';

const objectionLogSchema = new mongoose.Schema(
    {
        chatSessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatSession', required: true },
        messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatMessage' },
        familyId: { type: String, required: true, index: true },
        district: String,
        tradeId: String,
        speaker: { type: String, enum: ['parent', 'learner'] },
        category: { type: String, enum: ['income', 'job_security', 'social_status', 'safety', 'training_quality', 'distance_cost', 'further_education', 'gender_norms', 'other'], default: 'other' },
        sentiment: { type: Number, min: -1, max: 1 },
        resolved: { type: Boolean, default: false },
        isSynthetic: { type: Boolean, default: false, index: true },
    },
    { timestamps: true }
);

export default mongoose.model('ObjectionLog', objectionLogSchema);
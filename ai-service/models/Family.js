import mongoose from 'mongoose';

const familySchema = new mongoose.Schema(
    {
        familyId: { type: String, required: true, unique: true, index: true },
        learnerName: { type: String, required: true },
        parentName: { type: String, required: true },
        phone: { type: String, required: true },
        district: { type: String, required: true },
        state: { type: String, default: 'Maharashtra' },
        areaType: { type: String, enum: ['rural', 'semiurban', 'urban'] },
        incomeBracket: { type: String, enum: ['below_1L', '1_3L', '3_6L', 'above_6L'] },
        learnerEducation: { type: String, enum: ['class8', 'class10', 'class12', 'dropout', 'graduate'] },
        learnerMarksPercent: { type: Number, min: 0, max: 100 },
        learnerInterests: { type: [String], default: [] },
        preferredLanguage: { type: String, enum: ['en', 'mr', 'hi'], default: 'en' },
        counsellorId: { type: String, default: null },
        consentGiven: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('Family', familySchema);
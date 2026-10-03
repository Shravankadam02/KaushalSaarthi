import mongoose from 'mongoose';

const providerSchema = new mongoose.Schema(
    {
        providerId: { type: String, required: true, unique: true, index: true },
        name: { type: String, required: true },
        type: { type: String, enum: ['ITI', 'NSDC_partner', 'PMKVY_center', 'polytechnic', 'private'], required: true },
        district: { type: String, required: true, index: true },
        state: { type: String, default: 'Maharashtra' },
        address: String,
        contactPhone: String,
        tradesOffered: [{ type: String, ref: 'Trade' }],
        fees: Number,
        verified: { type: Boolean, default: false },
    },
    { timestamps: true }
);

export default mongoose.model('Provider', providerSchema);
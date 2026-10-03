import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['user', 'ai', 'counsellor'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
}, { _id: false });

const counsellingSessionSchema = new mongoose.Schema(
  {
    learnerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    messages: [messageSchema],
    mainConcern: { type: String },
    language: { type: String, default: 'English' }, // 'English' or 'Marathi'
    beforeConfidence: { type: Number, min: 1, max: 5 },
    afterConfidence: { type: Number, min: 1, max: 5 },
    status: { type: String, enum: ['Pending', 'Assigned', 'In Progress', 'Resolved'], default: 'Pending' },
  },
  { timestamps: true }
);

export default mongoose.model('CounsellingSession', counsellingSessionSchema);

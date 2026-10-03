import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/auth.js';
import uploadRoutes from './routes/upload.js';
import studentRoutes from './routes/students.js';
import notesRoutes from './routes/notes.js';
import summaryRoutes from './routes/summary.js';
import mentorRoutes from './routes/mentors.js';
import escalationRoutes from './routes/escalations.js';
import chatRoutes from './routes/chat.js';
import counsellorRoutes from './routes/counsellors.js';
import notificationRoutes from './routes/notifications.js';
import reportRoutes from './routes/reports.js';
import resourceRoutes from './routes/resources.js';
import tradeRoutes from './routes/trades.js';
import outcomeRoutes from './routes/outcomes.js';
import providerRoutes from './routes/providers.js';
import sentimentRoutes from './routes/sentiment.js';
import familyRoutes from './routes/families.js';
import insightRoutes from './routes/insights.js';
const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/summary', summaryRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/escalations', escalationRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/counsellors', counsellorRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/outcomes', outcomeRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/sentiment', sentimentRoutes);
app.use('/api/families', familyRoutes);
app.use('/api/insights', insightRoutes);
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'KaushalSaarthi API running' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
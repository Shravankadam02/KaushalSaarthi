import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import connectDB from './config/db.js';
import chatRoutes from './routes/chat.js';

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI service running' });
});

app.post('/test', async (req, res) => {
  try {
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_CHAT_MODEL || 'gemini-3.8-flash',
    });
    const result = await model.generateContent(req.body.prompt || 'Say hello in one sentence.');
    res.json({ response: result.response.text() });
  } catch (err) {
    res.status(500).json({ message: 'Gemini call failed', error: err.message });
  }
});

app.use('/chat', chatRoutes);

const PORT = process.env.PORT || 8001;
app.listen(PORT, () => {
  console.log(`AI service running on port ${PORT}`);
});
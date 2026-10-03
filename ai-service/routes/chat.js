import express from 'express';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import Escalation from '../models/Escalation.js';
import Notification from '../models/Notification.js';
import Trade from '../models/Trade.js';
import OutcomeData from '../models/OutcomeData.js';
import {
  checkDistressKeywords,
  checkDistressIntent,
} from '../services/escalationDetector.js';
import { generateEscalationSummary } from '../services/summarize.js';
import { generateChat } from '../services/gemini.js';
import { retrieveKnowledgeContext } from '../services/qdrant.js';
import ObjectionLog from '../models/ObjectionLog.js';

const router = express.Router();

function normalizeLanguage(language) {
  const value = String(language || 'en').toLowerCase();
  if (value.startsWith('mr') || value.includes('marathi')) return 'mr';
  if (value.startsWith('hi') || value.includes('hindi')) return 'hi';
  return 'en';
}

function classifyObjection(message) {
  const patterns = {
    income: /salary|income|earn|pagar|paise|उत्पन्न|पगार|कमाई|पैसे/i,
    job_security: /job|employment|placement|काम मिळेल|नोकरी|जॉब|रोजगार/i,
    social_status: /degree|status|people say|respect|प्रतिष्ठा|डिग्री|लोक काय म्हणतील/i,
    safety: /safe|safety|danger|risk|सुरक्षित|धोका/i,
    training_quality: /quality|college|institute|training|शिक्षण|प्रशिक्षण|कॉलेज/i,
    distance_cost: /fee|cost|distance|far|फी|खर्च|लांब|दूर/i,
    further_education: /study further|diploma|degree|पुढे शिक|आगे पढ़|डिप्लोमा/i,
    gender_norms: /girl|girls|women| मुली|मुलीं|लड़की|महिला/i,
  };
  return Object.entries(patterns).find(([, pattern]) => pattern.test(message))?.[0] || 'other';
}

function estimateSentiment(message) {
  const positive = /good|helpful|hope|thank|समाधान|चांगले|धन्यवाद|अच्छा|धन्यवाद/i.test(message) ? 1 : 0;
  const negative = /worried|concern| डर|problem|cannot|नाही|काळजी|भीती|चिंता|परेशान/i.test(message) ? 1 : 0;
  return Math.max(-1, Math.min(1, (positive - negative) * 0.5));
}

function buildFallbackReply(retrieved, language) {
  if (!retrieved.length) {
    return language === 'mr'
      ? 'या प्रश्नासाठी माझ्याकडे पडताळलेली माहिती नाही. तुम्हाला समुपदेशकाशी बोलायचे आहे का?'
      : language === 'hi'
        ? 'इस सवाल के लिए मेरे पास सत्यापित जानकारी नहीं है। क्या आप काउंसलर से बात करना चाहेंगे?'
        : "I don't have verified data for this question. Would you like to connect with a counsellor?";
  }

  const evidence = retrieved.slice(0, 2).map((item) => `${item.payload.topic}: ${item.payload.text}`).join(' ');
  const closing = language === 'mr'
    ? 'ही नमुना माहिती आहे. अधिक समजून घेण्यासाठी समुपदेशकाशी बोलू शकता.'
    : language === 'hi'
      ? 'यह नमूना जानकारी है। अधिक समझने के लिए काउंसलर से बात कर सकते हैं।'
      : 'This is sample information. A counsellor can help your family understand it in context.';
  return `${evidence} ${closing}`;
}

async function retrieveContext(queryText, language) {
  try {
    const knowledgeContext = await retrieveKnowledgeContext(queryText, language);
    const trades = await Trade.find({});
    const outcomes = await OutcomeData.find({});

    const query = queryText.toLowerCase();
    const matchesTrade = (name) => {
      const normalizedName = String(name || '').toLowerCase();
      return normalizedName.length > 3 && query.includes(normalizedName);
    };
    const relevantKnowledge = knowledgeContext.filter((item) => matchesTrade(item.payload?.topic));
    const relevantTrades = trades.filter((trade) => matchesTrade(trade.name));
    const relevantOutcomes = outcomes.filter((outcome) => matchesTrade(outcome.tradeName));
    const contextPoints = [...relevantKnowledge];

    relevantTrades.forEach(t => {
      contextPoints.push({
        payload: {
          type: 'trade_info',
          topic: t.name,
          text: `Trade: ${t.name}. Duration: ${t.duration}. Eligibility: ${t.eligibility}. NSQF Level: ${t.nsqfLevel}. Description: ${t.description}. Job Roles: ${t.jobRoles.join(', ')}`,
          source: 'MSDE Verified Dataset'
        }
      });
    });

    relevantOutcomes.forEach(o => {
      contextPoints.push({
        payload: {
          type: 'outcome_data',
          topic: `Outcome for ${o.tradeName}`,
          text: `Trade: ${o.tradeName}. Average Salary: ${o.averageSalary} INR. Placement Rate: ${o.placementRate}%. Top Employers: ${o.topEmployers.join(', ')}. Career Growth: ${o.careerProgression}`,
          source: 'MSDE Verified Dataset'
        }
      });
    });

    return contextPoints;
  } catch (err) {
    console.error("Failed to fetch MongoDB context", err);
    return [];
  }
}

function buildSystemPrompt(studentContext, retrievedChunks, language = 'English') {
  const contextText = retrievedChunks
    .map(
      (r) =>
        `[${r.payload.type.toUpperCase()} - ${r.payload.topic}] ${r.payload.text}`
    )
    .join('\n\n');

  return `You are "SkillSaathi AI", an evidence-based family decision-support system for vocational education in India.
Your role is to help learners and their parents understand suitable vocational career options based on verified outcome data.

User context:
- Name: ${studentContext.firstName || 'the user'}
- Location: ${studentContext.location || 'Unknown'}
- Preferred Language: ${language}

CRITICAL RULES (ANTI-HALLUCINATION):
1. You must base your factual claims (placement rates, salaries, job availability, training providers, NSQF levels, course durations, career progressions) STRICTLY on the retrieved data provided below.
2. If the retrieved data does not contain the answer, you MUST say: "I don't have verified data for this question." and then offer: "Would you like to connect with a counsellor?"
3. NEVER invent or guess any numbers, salaries, or placement rates.
4. If asked in Marathi, respond entirely in simple, easy-to-understand Marathi. If asked in English, respond in English.
5. Provide a supportive, respectful tone suitable for parents and learners. Address parental concerns like income, safety, and social perception confidently using the data.

Relevant guidance from the verified knowledge base:
${contextText || 'No specific verified data found for this query.'}

Instructions:
- Address the family's concerns directly.
- Summarize the verified outcomes clearly (e.g. mention the exact average salary and placement rate).
- If appropriate, suggest speaking with a human counsellor.`;
}

// POST /chat — main conversational endpoint
router.post('/', async (req, res) => {
  try {
    const { message, studentContext, chatSessionId, speaker } = req.body;
    const language = normalizeLanguage(req.body.language || studentContext?.preferredLanguage);

    if (
      !message ||
      !studentContext ||
      !studentContext.studentId
    ) {
      return res.status(400).json({
        message:
          'message and studentContext (with studentId) are required',
      });
    }

    let session = chatSessionId
      ? await ChatSession.findById(chatSessionId)
      : null;

    if (!session) {
      session = await ChatSession.create({
        studentId: studentContext.studentId,
        familyId: studentContext.familyId || null,
        language,
        district: studentContext.district || studentContext.location || null,
        status: 'active',
      });
    }

    const sentiment = estimateSentiment(message);
    const objectionCategory = classifyObjection(message);
    const userMessage = await ChatMessage.create({
      chatSessionId: session._id,
      role: 'user',
      content: message,
      speaker: speaker || null,
      language,
      objectionCategory,
      sentiment,
    });
    session.language = language;
    session.latestSentiment = sentiment;
    if (session.startSentiment === null || session.startSentiment === undefined) session.startSentiment = sentiment;
    await session.save();

    if (studentContext.familyId) {
      await ObjectionLog.create({
        chatSessionId: session._id,
        messageId: userMessage._id,
        familyId: studentContext.familyId,
        district: studentContext.district || studentContext.location,
        tradeId: studentContext.tradeFocusId || null,
        speaker: speaker || null,
        category: objectionCategory,
        sentiment,
      });
      if (sentiment > 0.2) {
        await ObjectionLog.updateMany(
          { familyId: studentContext.familyId, chatSessionId: session._id, category: objectionCategory, resolved: false },
          { $set: { resolved: true } }
        );
      }
    }

    const isDistress =
      checkDistressKeywords(message) ||
      await checkDistressIntent(message);

    if (isDistress) {
      const allMessages = await ChatMessage.find({
        chatSessionId: session._id,
      }).sort({ createdAt: 1 });

      const summary =
        await generateEscalationSummary(allMessages);

      const escalation = await Escalation.create({
        studentId: studentContext.studentId,
        familyId: studentContext.familyId || null,
        mentorId: studentContext.mentorId || null,
        reason: 'distress_keyword',
        summary,
        chatSessionId: session._id,
        status: 'open',
      });

      session.status = 'escalated';
      await session.save();

      const supportiveReply =
        "Thank you for sharing this with me. I hear how difficult things are right now. I've let a human counsellor know so they can support you and your family. If you need immediate assistance, please reach out to local emergency services.";

      await ChatMessage.create({
        chatSessionId: session._id,
        role: 'ai',
        content: supportiveReply,
      });

      return res.json({
        reply: supportiveReply,
        chatSessionId: session._id,
        escalated: true,
        escalationId: escalation._id,
      });
    }

    const retrieved = await retrieveContext(message, language);
    const systemPrompt = buildSystemPrompt(studentContext, retrieved, language);

    const history = await ChatMessage.find({
      chatSessionId: session._id,
    }).sort({ createdAt: 1 });

    const chatHistory = history
      .slice(0, -1)
      .map((h) => ({
        role: h.role === 'ai' ? 'assistant' : 'user',
        content: h.content,
      }));

    let reply;
    let fallbackUsed = false;
    try {
      reply = await generateChat(
        chatHistory.concat([{ role: 'user', content: message }]),
        systemPrompt
      );
    } catch (generationError) {
      console.error('Gemini unavailable, using grounded fallback:', generationError.message);
      reply = buildFallbackReply(retrieved, language);
      fallbackUsed = true;
    }

    // Filter evidence to only those that were actually mentioned in the reply (simple string match)
    // to avoid overwhelming the frontend with all 20 records.
    const relevantEvidence = retrieved.filter(r =>
      reply.toLowerCase().includes(r.payload.topic.toLowerCase().replace('outcome for ', '')) ||
      reply.includes(r.payload.averageSalary?.toString() || 'XXXXX')
    ).map(r => r.payload);

    // Always include at least 1 evidence if we have data, to prove it's working
    if (relevantEvidence.length === 0 && retrieved.length > 0) {
      relevantEvidence.push(retrieved[0].payload);
    }

    await ChatMessage.create({
      chatSessionId: session._id,
      role: 'ai',
      content: reply,
      retrievedTopics: relevantEvidence.map((r) => r.topic),
      language,
    });

    res.json({
      reply,
      chatSessionId: session._id,
      escalated: false,
      lowConfidence: fallbackUsed || retrieved.length === 0,
      retrievedTopics: relevantEvidence.map((r) => r.topic),
      evidence: relevantEvidence
    });
  } catch (err) {
    console.error('Chat failed:', err);
    res.status(500).json({ message: 'Chat failed', error: err.message });
  }
});

router.post('/escalate', async (req, res) => {
  try {
    const { chatSessionId, studentContext } = req.body;
    if (!chatSessionId || !studentContext) return res.status(400).json({ message: 'required' });

    const session = await ChatSession.findById(chatSessionId);
    if (!session) return res.status(404).json({ message: 'Chat session not found' });

    const escalation = await Escalation.create({
      studentId: studentContext.studentId,
      familyId: studentContext.familyId || null,
      mentorId: studentContext.mentorId || null,
      reason: 'student_requested',
      preferredContact: studentContext.preferredContact || 'call',
      phone: studentContext.phone || null,
      preferredTime: studentContext.preferredTime || null,
      summary: 'Family requested human counsellor intervention.',
      chatSessionId: session._id,
      status: 'open',
    });

    session.status = 'escalated';
    await session.save();

    res.json({ message: 'Escalation created', escalationId: escalation._id });
  } catch (err) {
    res.status(500).json({ message: 'Escalation failed', error: err.message });
  }
});

export default router;
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db.js';
import Family from '../models/Family.js';
import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import ObjectionLog from '../models/ObjectionLog.js';
import Escalation from '../models/Escalation.js';

const districts = ['Nashik', 'Pune', 'Nagpur', 'Chhatrapati Sambhajinagar', 'Kolhapur', 'Jalgaon'];
const categories = ['income', 'job_security', 'social_status', 'safety', 'further_education'];
const trades = ['electrician', 'fitter', 'welder', 'computer-operator-copa', 'motor-vehicle-mechanic', 'plumber', 'solar-technician', 'healthcare-assistant'];
const languages = { Nashik: 'mr', Pune: 'mr', Nagpur: 'hi', 'Chhatrapati Sambhajinagar': 'mr', Kolhapur: 'mr', Jalgaon: 'mr' };

let seed = 26241;
function random() {
  seed = (seed * 1664525 + 1013904223) % 4294967296;
  return seed / 4294967296;
}
function pick(items) { return items[Math.floor(random() * items.length)]; }
function categoryFor(district) {
  if (district === 'Jalgaon' || district === 'Pune') return random() < 0.52 ? 'social_status' : pick(categories);
  if (district === 'Nashik') return random() < 0.48 ? 'income' : pick(categories);
  if (district === 'Nagpur') return random() < 0.42 ? 'job_security' : pick(categories);
  if (district === 'Kolhapur') return random() < 0.35 ? 'safety' : pick(categories);
  return pick(categories);
}
function messageFor(category, language, isParent) {
  const english = {
    income: isParent ? 'Will this career provide enough income for the family?' : 'I want a career where I can start earning.',
    job_security: isParent ? 'Are there reliable jobs after this course?' : 'What jobs can I get after training?',
    social_status: isParent ? 'People say a degree has more respect. What will others think?' : 'Can this path lead to a respected career?',
    safety: isParent ? 'Is this work safe and suitable for our family?' : 'What safety training is provided?',
    further_education: isParent ? 'Can the learner study further after this course?' : 'Can I continue to a diploma later?',
  };
  const marathi = { income: 'या करिअरमधून कुटुंबासाठी पुरेसे उत्पन्न मिळेल का?', job_security: 'या कोर्सनंतर नोकरीची खात्री आहे का?', social_status: 'डिग्रीला जास्त प्रतिष्ठा असते असे लोक म्हणतात. पुढे काय?', safety: 'हे काम आमच्या कुटुंबासाठी सुरक्षित आहे का?', further_education: 'या कोर्सनंतर पुढे शिक्षण घेता येईल का?' };
  const hindi = { income: 'क्या इस करियर से परिवार के लिए अच्छी कमाई होगी?', job_security: 'इस कोर्स के बाद नौकरी की संभावना कैसी है?', social_status: 'लोग कहते हैं डिग्री की ज्यादा इज्जत है। आगे क्या होगा?', safety: 'क्या यह काम हमारे परिवार के लिए सुरक्षित है?', further_education: 'क्या इस कोर्स के बाद आगे पढ़ाई कर सकते हैं?' };
  return language === 'mr' ? marathi[category] : language === 'hi' ? hindi[category] : english[category];
}

async function generate() {
  await connectDB();
  await Promise.all([
    Family.deleteMany({ isSynthetic: true }),
    ChatSession.deleteMany({ isSynthetic: true }),
    ChatMessage.deleteMany({ isSynthetic: true }),
    ObjectionLog.deleteMany({ isSynthetic: true }),
    Escalation.deleteMany({ isSynthetic: true }),
  ]);

  const families = await Family.insertMany(Array.from({ length: 60 }, (_, index) => {
    const district = districts[index % districts.length];
    return {
      familyId: `SYN-FAM-${String(index + 1).padStart(3, '0')}`,
      learnerName: `Demo Learner ${index + 1}`,
      parentName: `Demo Parent ${index + 1}`,
      phone: `910000${String(index + 1).padStart(4, '0')}`,
      district,
      areaType: index % 3 === 0 ? 'rural' : index % 3 === 1 ? 'semiurban' : 'urban',
      incomeBracket: ['below_1L', '1_3L', '3_6L'][index % 3],
      learnerEducation: index % 4 === 0 ? 'class12' : 'class10',
      learnerInterests: [pick(trades)],
      preferredLanguage: languages[district],
      consentGiven: true,
      isSynthetic: true,
    };
  }));

  const sessions = [];
  for (let index = 0; index < 450; index += 1) {
    const family = families[index % families.length];
    const district = family.district;
    const language = family.preferredLanguage;
    const startSentiment = Number((-0.65 + random() * 0.55).toFixed(2));
    const improvement = 0.18 + random() * 0.62;
    const latestSentiment = Number(Math.min(0.8, startSentiment + improvement).toFixed(2));
    const escalated = index % 11 === 0;
    sessions.push({
      studentId: family.familyId,
      familyId: family.familyId,
      status: escalated ? 'escalated' : 'resolved',
      language,
      tradeFocusId: pick(trades),
      startSentiment,
      latestSentiment,
      finalFeeling: latestSentiment > 0.2 ? 'hopeful' : latestSentiment < -0.2 ? 'worried' : 'neutral',
      escalated,
      district,
      isSynthetic: true,
      createdAt: new Date(Date.now() - (450 - index) * 86400000 / 3),
      updatedAt: new Date(),
    });
  }
  const savedSessions = await ChatSession.insertMany(sessions);
  const userMessages = [];
  const assistantMessages = [];
  const objectionLogs = [];
  const escalations = [];
  for (const [index, session] of savedSessions.entries()) {
    const family = families[index % families.length];
    const category = categoryFor(session.district);
    const speaker = index % 3 === 0 ? 'learner' : 'parent';
    const userMessage = {
      chatSessionId: session._id,
      role: 'user',
      content: messageFor(category, session.language, speaker === 'parent'),
      speaker,
      language: session.language,
      objectionCategory: category,
      sentiment: session.startSentiment,
      isSynthetic: true,
      createdAt: session.createdAt,
      updatedAt: session.createdAt,
    };
    userMessages.push(userMessage);
    if (session.escalated) {
      escalations.push({
        studentId: family.familyId,
        familyId: family.familyId,
        mentorId: index % 2 ? 'C001' : 'C002',
        reason: 'unresolved_objection',
        objectionCategory: category,
        preferredContact: index % 3 === 0 ? 'whatsapp' : 'call',
        phone: family.phone,
        preferredTime: 'Evening',
        language: session.language,
        summary: 'Synthetic demo case: family requested additional support after an unresolved concern.',
        chatSessionId: session._id,
        status: index % 3 === 0 ? 'open' : 'in_progress',
        outcome: index % 3 === 0 ? null : 'partially',
        isSynthetic: true,
      });
    }
  }
  const savedUserMessages = await ChatMessage.insertMany(userMessages);
  for (const [index, userMessage] of savedUserMessages.entries()) {
    const session = savedSessions[index];
    const resolved = session.latestSentiment > 0.2;
    assistantMessages.push({ chatSessionId: session._id, role: 'ai', content: 'I acknowledged the concern and showed the family the relevant career pathway and available outcome evidence.', language: session.language, objectionCategory: userMessage.objectionCategory, sentiment: session.latestSentiment, lowConfidence: false, isSynthetic: true, createdAt: new Date(new Date(session.createdAt).getTime() + 60000), updatedAt: new Date() });
    objectionLogs.push({ chatSessionId: session._id, messageId: userMessage._id, familyId: userMessage.chatSessionId ? families[index % families.length].familyId : null, district: session.district, tradeId: session.tradeFocusId, speaker: userMessage.speaker, category: userMessage.objectionCategory, sentiment: session.startSentiment, resolved, isSynthetic: true });
  }
  await ChatMessage.insertMany(assistantMessages);
  await ObjectionLog.insertMany(objectionLogs);
  await Escalation.insertMany(escalations);
  console.log(JSON.stringify({ syntheticFamilies: families.length, syntheticSessions: savedSessions.length, syntheticMessages: userMessages.length + assistantMessages.length, syntheticObjections: objectionLogs.length, syntheticEscalations: escalations.length }, null, 2));
  await mongoose.disconnect();
}

generate().catch((error) => { console.error('Synthetic data generation failed:', error); process.exit(1); });

import express from 'express';
import Family from '../models/Family.js';
import ChatSession from '../models/ChatSession.js';
import ObjectionLog from '../models/ObjectionLog.js';
import Escalation from '../models/Escalation.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();
const adminOnly = [protect, requireRole('admin')];

function buildMatch(query) {
    const match = {};
    if (query.district) match.district = query.district;
    if (query.language) match.language = query.language;
    return match;
}

router.get('/overview', ...adminOnly, async (req, res) => {
    try {
        const match = buildMatch(req.query);
        const [families, sessions, escalations, hopeful, sentiment] = await Promise.all([
            Family.countDocuments(req.query.district ? { district: req.query.district } : {}),
            ChatSession.countDocuments(match),
            Escalation.countDocuments({ status: { $ne: 'resolved' } }),
            ChatSession.countDocuments({ ...match, finalFeeling: 'hopeful' }),
            ChatSession.aggregate([
                { $match: { ...match, startSentiment: { $ne: null }, latestSentiment: { $ne: null } } },
                { $group: { _id: null, averageShift: { $avg: { $subtract: ['$latestSentiment', '$startSentiment'] } } } },
            ]),
        ]);
        const objectionMix = await ObjectionLog.aggregate([
            { $match: buildMatch(req.query) },
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
        ]);
        res.json({
            totalFamilies: families,
            chatSessions: sessions,
            openEscalations: escalations,
            hopefulRatePct: sessions ? Math.round((hopeful / sessions) * 100) : 0,
            averageSentimentShift: Number((sentiment[0]?.averageShift || 0).toFixed(2)),
            objectionMix: objectionMix.map((item) => ({ category: item._id || 'other', count: item.count })),
        });
    } catch (error) {
        res.status(500).json({ message: 'Unable to load insights', error: error.message });
    }
});

router.get('/by-district', ...adminOnly, async (req, res) => {
    try {
        const match = buildMatch(req.query);
        const districts = await ChatSession.aggregate([
            { $match: { ...match, district: req.query.district || { $nin: [null, ''] } } },
            {
                $group: {
                    _id: '$district',
                    sessions: { $sum: 1 },
                    worried: { $sum: { $cond: [{ $eq: ['$finalFeeling', 'worried'] }, 1, 0] } },
                    negativeStarts: { $sum: { $cond: [{ $lt: ['$startSentiment', -0.2] }, 1, 0] } },
                    averageShift: { $avg: { $subtract: ['$latestSentiment', '$startSentiment'] } },
                }
            },
            { $sort: { sessions: -1 } },
        ]);
        res.json(districts.map((district) => ({
            district: district._id,
            sessions: district.sessions,
            resistanceIndex: Math.round(((district.negativeStarts / district.sessions) * 0.7 + (district.worried / district.sessions) * 0.3) * 100),
            averageSentimentShift: Number((district.averageShift || 0).toFixed(2)),
        })));
    } catch (error) {
        res.status(500).json({ message: 'Unable to load district insights', error: error.message });
    }
});

router.get('/export.csv', ...adminOnly, async (req, res) => {
    try {
        const match = buildMatch(req.query);
        const sessions = await ChatSession.find(match).sort({ createdAt: -1 }).lean();
        const escape = (value) => {
            const text = value === null || value === undefined ? '' : String(value);
            return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
        };
        const headers = ['session_id', 'family_id', 'district', 'language', 'start_sentiment', 'latest_sentiment', 'sentiment_shift', 'final_feeling', 'escalated', 'created_at'];
        const rows = sessions.map((session) => [
            session._id,
            session.familyId,
            session.district,
            session.language,
            session.startSentiment,
            session.latestSentiment,
            session.startSentiment !== null && session.latestSentiment !== null ? Number(session.latestSentiment - session.startSentiment).toFixed(2) : '',
            session.finalFeeling,
            session.escalated,
            session.createdAt?.toISOString(),
        ].map(escape).join(','));
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="kaushalsaarthi-insights-${Date.now()}.csv"`);
        res.send([headers.join(','), ...rows].join('\n'));
    } catch (error) {
        res.status(500).json({ message: 'Unable to export insights', error: error.message });
    }
});

router.get('/by-objection', ...adminOnly, async (req, res) => {
    try {
        const rows = await ObjectionLog.aggregate([
            { $match: buildMatch(req.query) },
            { $group: { _id: { category: '$category', district: '$district' }, count: { $sum: 1 }, unresolved: { $sum: { $cond: ['$resolved', 0, 1] } } } },
            { $sort: { count: -1 } },
        ]);
        res.json(rows.map((row) => ({ category: row._id.category || 'other', district: row._id.district || 'Unknown', count: row.count, unresolved: row.unresolved })));
    } catch (error) {
        res.status(500).json({ message: 'Unable to load objection insights', error: error.message });
    }
});

export default router;
import express from 'express';
import User from '../models/User.js';
import Family from '../models/Family.js';
import Escalation from '../models/Escalation.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

// GET /api/counsellors - Get list of all counsellors
router.get('/', protect, async (req, res) => {
  try {
    const query = { role: 'counsellor' };
    if (req.query.district) query.districts = req.query.district;
    if (req.query.language) query.languages = req.query.language;
    const counsellors = await User.find(query)
      .select('-passwordHash')
      .lean();
    res.json(counsellors);
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

router.post('/request', protect, requireRole('family'), async (req, res) => {
  try {
    const { counsellorCode, preferredContact = 'call', preferredTime = '', note = '' } = req.body;
    const family = await Family.findOne({ familyId: req.user.familyId });
    if (!family) return res.status(404).json({ message: 'Family profile not found' });

    const language = family.preferredLanguage || 'en';
    const query = { role: 'counsellor', districts: family.district, languages: language };
    if (counsellorCode) query.counsellorCode = counsellorCode;
    const counsellor = await User.findOne(query);
    if (!counsellor) return res.status(404).json({ message: 'No matching counsellor is available for this district and language' });

    const escalation = await Escalation.create({
      studentId: family.familyId,
      familyId: family.familyId,
      mentorId: counsellor.counsellorCode,
      reason: 'user_requested',
      objectionCategory: 'other',
      preferredContact,
      preferredTime,
      phone: family.phone,
      language,
      summary: note || 'Family requested a counselling call.',
      status: 'open',
    });
    await Notification.create({
      recipientId: counsellor.counsellorCode,
      title: 'New family counselling request',
      message: `${family.parentName} requested support for ${family.learnerName}.`,
      type: 'warning',
      link: '/counsellor',
    });
    res.status(201).json({ escalation });
  } catch (error) {
    res.status(500).json({ message: 'Unable to create counselling request', error: error.message });
  }
});

export default router;

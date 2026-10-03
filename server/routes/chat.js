import express from 'express';
import axios from 'axios';
import Student from '../models/Student.js';
import Family from '../models/Family.js';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8001';

// POST /api/chat — proxies to the AI service, but builds studentContext server-side
// from the authenticated user's own record, not from client-supplied data
router.post('/', protect, requireRole('student', 'family'), async (req, res) => {
  try {
    const { message, chatSessionId, language, speaker } = req.body;

    if (!message) {
      return res.status(400).json({ message: 'message is required' });
    }

    let studentContext;
    let student;
    if (req.user.role === 'family') {
      const family = await Family.findOne({ familyId: req.user.familyId });
      if (!family) return res.status(404).json({ message: 'Family profile not found' });
      studentContext = {
        studentId: family.familyId,
        familyId: family.familyId,
        firstName: family.learnerName,
        location: family.district,
        district: family.district,
        state: family.state,
        incomeBracket: family.incomeBracket,
        learnerEducation: family.learnerEducation,
        interests: family.learnerInterests,
        preferredLanguage: family.preferredLanguage,
        speaker,
      };
    } else {
      student = await Student.findOne({ studentId: req.user.studentId });
      if (!student) return res.status(404).json({ message: 'Student record not found' });
      studentContext = {
        studentId: student.studentId,
        mentorId: student.mentorId,
        firstName: student.firstName,
        attendancePercent: student.attendancePercent,
        last3TestsAvg: student.last3TestsAvg,
        feesDueDays: student.feesDueDays,
      };
    }

    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/chat`,
      {
        message,
        studentContext,
        chatSessionId,
        language,
        speaker,
      },
      { timeout: 25000 }
    );

    res.json(aiRes.data);
  } catch (err) {
    res.status(500).json({ message: 'Chat request failed', error: err.message });
  }
});

// POST /api/chat/escalate — same proxy pattern for manual escalation
router.post('/escalate', protect, requireRole('student', 'family'), async (req, res) => {
  try {
    const { chatSessionId, preferredContact, preferredTime } = req.body;
    if (!chatSessionId) {
      return res.status(400).json({ message: 'chatSessionId is required' });
    }

    let student;
    let family;
    if (req.user.role === 'family') {
      family = await Family.findOne({ familyId: req.user.familyId });
      if (!family) return res.status(404).json({ message: 'Family profile not found' });
    } else {
      student = await Student.findOne({ studentId: req.user.studentId });
      if (!student) return res.status(404).json({ message: 'Student record not found' });
    }

    const studentContext = {
      studentId: family?.familyId || student.studentId,
      familyId: family?.familyId,
      mentorId: student?.mentorId,
      phone: family?.phone || student?.phone,
      preferredContact,
      preferredTime,
    };

    const aiRes = await axios.post(
      `${AI_SERVICE_URL}/chat/escalate`,
      { chatSessionId, studentContext },
      { timeout: 25000 }
    );

    // Notify the assigned mentor for legacy student accounts.
    if (student?.mentorId) {
      await Notification.create({
        recipientId: student.mentorId,
        title: 'New Student Escalation',
        message: `${student.firstName} ${student.lastName} escalated a chat and requested your help.`,
        type: 'warning',
        link: '/mentor/escalations'
      });
    }

    res.json(aiRes.data);
  } catch (err) {
    res.status(500).json({ message: 'Escalation request failed', error: err.message });
  }
});

export default router;
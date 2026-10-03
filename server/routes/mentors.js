import express from 'express';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';
import Student from '../models/Student.js';

const router = express.Router();

// GET /api/mentors/mine — student only, returns their own assigned mentor's info
router.get('/mine', protect, requireRole('student'), async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.user.studentId });
    if (!student || !student.mentorId) {
      return res.json({ mentor: null });
    }

    const mentor = await User.findOne({ mentorCode: student.mentorId }).select('username mentorCode');
    res.json({ mentor: mentor || null });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// GET /api/mentors — admin only, list of mentor accounts
router.get('/', protect, requireRole('admin'), async (req, res) => {
  try {
    const mentors = await User.find({ role: 'mentor' }).select('username mentorCode');
    res.json({ mentors });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
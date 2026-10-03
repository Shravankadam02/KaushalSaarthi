import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Family from '../models/Family.js';

const router = express.Router();

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const {
      username, password, role, studentId, mentorCode, counsellorCode, specialization, phone, location,
      familyId, learnerName, parentName, district, state, areaType, incomeBracket, learnerEducation,
      learnerMarksPercent, learnerInterests, preferredLanguage, consentGiven,
    } = req.body;

    if (!username || !password || !role) {
      return res.status(400).json({ message: 'username, password, and role are required' });
    }

    if (!['student', 'mentor', 'counsellor', 'family'].includes(role)) {
      return res.status(400).json({ message: 'Unsupported self-registration role' });
    }

    if (role === 'mentor' && !mentorCode) {
      return res.status(400).json({ message: 'mentorCode is required for mentor accounts' });
    }

    if (role === 'counsellor' && !counsellorCode) {
      return res.status(400).json({ message: 'counsellorCode is required for counsellor accounts' });
    }

    if (role === 'student') {
      if (!studentId) {
        return res.status(400).json({ message: 'studentId is required for student accounts' });
      }
      const Student = (await import('../models/Student.js')).default;
      const existingStudent = await Student.findOne({ studentId });
      if (!existingStudent) {
        return res.status(404).json({ message: 'No student record found with that Student ID. Contact your admin.' });
      }
    }

    if (role === 'family' && (!learnerName || !parentName || !phone || !district || !learnerEducation)) {
      return res.status(400).json({ message: 'learnerName, parentName, phone, district, and learnerEducation are required for family accounts' });
    }

    const existing = await User.findOne({ username });
    if (existing) {
      return res.status(409).json({ message: 'Username already taken' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const resolvedFamilyId = role === 'family' ? (familyId || `FAM-${Date.now()}`) : null;
    if (role === 'family') {
      await Family.create({
        familyId: resolvedFamilyId,
        learnerName,
        parentName,
        phone,
        district,
        state,
        areaType,
        incomeBracket,
        learnerEducation,
        learnerMarksPercent,
        learnerInterests,
        preferredLanguage,
        consentGiven: Boolean(consentGiven),
      });
    }

    const user = await User.create({
      username,
      passwordHash,
      role,
      studentId: role === 'student' ? studentId : null,
      mentorCode: role === 'mentor' ? mentorCode : null,
      counsellorCode: role === 'counsellor' ? counsellorCode : null,
      specialization: role === 'counsellor' ? specialization : null,
      phone: role === 'counsellor' ? phone : null,
      location: role === 'counsellor' ? location : null,
      familyId: resolvedFamilyId,
    });

    res.status(201).json({
      message: 'Account created successfully',
      user: { id: user._id, username: user.username, role: user.role },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ $or: [{ username }, { phone: username }] });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        role: user.role,
        studentId: user.studentId,
        mentorCode: user.mentorCode,
        counsellorCode: user.counsellorCode,
        familyId: user.familyId,
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        role: user.role,
        studentId: user.studentId,
        mentorCode: user.mentorCode,
        counsellorCode: user.counsellorCode,
        phone: user.phone,
        location: user.location,
        familyId: user.familyId,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

export default router;
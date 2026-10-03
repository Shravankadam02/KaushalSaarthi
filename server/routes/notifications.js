import express from 'express';
import Notification from '../models/Notification.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// GET /api/notifications
// Fetch notifications for the current authenticated user
router.get('/', protect, async (req, res) => {
  try {
    let recipientId = req.user.username; // default fallback
    if (req.user.role === 'student') recipientId = req.user.studentId;
    if (req.user.role === 'mentor') recipientId = req.user.mentorCode;
    if (req.user.role === 'counsellor') recipientId = req.user.counsellorCode;

    const notifications = await Notification.find({ recipientId })
      .sort({ createdAt: -1 })
      .limit(50); // limit to recent 50

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications', error: error.message });
  }
});

// PUT /api/notifications/:id/read
// Mark a specific notification as read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification', error: error.message });
  }
});

// PUT /api/notifications/read-all
// Mark all notifications for this user as read
router.put('/read-all', protect, async (req, res) => {
  try {
    let recipientId = req.user.username;
    if (req.user.role === 'student') recipientId = req.user.studentId;
    if (req.user.role === 'mentor') recipientId = req.user.mentorCode;
    if (req.user.role === 'counsellor') recipientId = req.user.counsellorCode;

    await Notification.updateMany(
      { recipientId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: 'All marked as read' });
  } catch (error) {
    res.status(500).json({ message: 'Error updating notifications', error: error.message });
  }
});

export default router;

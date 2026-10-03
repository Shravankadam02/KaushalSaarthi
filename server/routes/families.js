import express from 'express';
import Family from '../models/Family.js';
import { protect } from '../middleware/auth.js';
import { requireRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.get('/me', protect, requireRole('family'), async (req, res) => {
    const family = await Family.findOne({ familyId: req.user.familyId });
    if (!family) return res.status(404).json({ message: 'Family profile not found' });
    res.json({ family });
});

router.put('/me', protect, requireRole('family'), async (req, res) => {
    const allowedFields = [
        'learnerName', 'parentName', 'phone', 'district', 'state', 'areaType', 'incomeBracket',
        'learnerEducation', 'learnerMarksPercent', 'learnerInterests', 'preferredLanguage', 'consentGiven',
    ];
    const updates = Object.fromEntries(
        allowedFields.filter((field) => req.body[field] !== undefined).map((field) => [field, req.body[field]])
    );
    const family = await Family.findOneAndUpdate(
        { familyId: req.user.familyId },
        updates,
        { new: true, runValidators: true }
    );
    if (!family) return res.status(404).json({ message: 'Family profile not found' });
    res.json({ family });
});

export default router;
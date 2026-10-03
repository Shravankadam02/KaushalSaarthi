import express from 'express';
import Provider from '../models/Provider.js';

const router = express.Router();

router.get('/', async (req, res) => {
    try {
        const query = {};
        if (req.query.district) query.district = req.query.district;
        if (req.query.tradeId) query.tradesOffered = req.query.tradeId;
        res.json(await Provider.find(query).sort({ name: 1 }));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

export default router;
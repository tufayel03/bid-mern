const express = require('express');
const router = express.Router();
const CampaignTemplate = require('../models/CampaignTemplate');
const Subscriber = require('../models/Subscriber');
const User = require('../models/User');

// --- Campaign Templates --- 
router.get('/templates', async (req, res) => {
    try {
        const templates = await CampaignTemplate.find().sort({ createdAt: -1 });
        res.json(templates);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/templates', async (req, res) => {
    try {
        const template = new CampaignTemplate(req.body);
        await template.save();
        res.status(201).json(template);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/templates/:id', async (req, res) => {
    try {
        await CampaignTemplate.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- Subscribers ---
router.get('/subscribers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const items = await Subscriber.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await Subscriber.countDocuments();

        res.json({
            items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});


// --- Users (CRM) ---
router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const items = await User.find().sort({ createdAt: -1 }).skip(skip).limit(limit);
        const total = await User.countDocuments();

        res.json({
            items,
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit)
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

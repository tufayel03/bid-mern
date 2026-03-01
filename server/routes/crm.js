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

router.post('/subscribers', async (req, res) => {
    try {
        const { email, name, source, isActive } = req.body || {};
        if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
            return res.status(400).json({ message: 'A valid email address is required.' });
        }
        const existing = await Subscriber.findOne({ email: email.trim().toLowerCase() });
        if (existing) return res.status(409).json({ message: 'Subscriber with this email already exists.' });

        const subscriber = await Subscriber.create({
            email: email.trim().toLowerCase(),
            name: name || '',
            source: source || 'manual',
            isActive: isActive !== undefined ? Boolean(isActive) : true
        });
        res.status(201).json(subscriber);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/subscribers/import', async (req, res) => {
    try {
        // Accept raw CSV as text/plain body
        const raw = typeof req.body === 'string' ? req.body : '';
        if (!raw.trim()) {
            return res.status(400).json({ message: 'Empty CSV body.' });
        }

        const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (!lines.length) {
            return res.status(400).json({ message: 'No rows found in CSV.' });
        }

        // Detect header row — if first line contains "email" treat as header
        const firstLine = lines[0].toLowerCase();
        const hasHeader = firstLine.includes('email');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        let inserted = 0;
        let skipped = 0;
        const errors = [];

        for (const line of dataLines) {
            const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
            const email = cols[0] ? cols[0].toLowerCase() : '';
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                skipped++;
                continue;
            }
            const name = cols[1] || '';
            const source = cols[2] || 'csv-import';
            const isActive = cols[3] !== undefined ? cols[3] !== 'false' && cols[3] !== '0' : true;

            try {
                const existing = await Subscriber.findOne({ email });
                if (existing) {
                    skipped++;
                } else {
                    await Subscriber.create({ email, name, source, isActive });
                    inserted++;
                }
            } catch (e) {
                skipped++;
                errors.push(email);
            }
        }

        res.json({ ok: true, inserted, skipped, errors });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/subscribers/:id/toggle', async (req, res) => {
    try {
        const subscriber = await Subscriber.findById(req.params.id);
        if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });
        subscriber.isActive = !subscriber.isActive;
        await subscriber.save();
        res.json({ ok: true, isActive: subscriber.isActive });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/subscribers/:id', async (req, res) => {
    try {
        const subscriber = await Subscriber.findByIdAndDelete(req.params.id);
        if (!subscriber) return res.status(404).json({ message: 'Subscriber not found' });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/subscribers/export', async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 });
        const header = 'email,name,source,isActive,createdAt';
        const rows = subscribers.map(s => {
            const email = String(s.email || '').replace(/,/g, '');
            const name = String(s.name || '').replace(/,/g, '');
            const source = String(s.source || '').replace(/,/g, '');
            const isActive = s.isActive ? 'true' : 'false';
            const createdAt = s.createdAt ? new Date(s.createdAt).toISOString() : '';
            return `${email},${name},${source},${isActive},${createdAt}`;
        });
        const csv = [header, ...rows].join('\r\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
        res.send(csv);
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

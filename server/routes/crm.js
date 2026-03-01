const express = require('express');
const router = express.Router();
const CampaignTemplate = require('../models/CampaignTemplate');
const Subscriber = require('../models/Subscriber');
const User = require('../models/User');

// ─── Campaign Templates ────────────────────────────────────────────────────────

router.get('/campaigns/templates', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 100;
        const templates = await CampaignTemplate.find().sort({ createdAt: -1 }).limit(limit);
        res.json({ items: templates, total: templates.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/campaigns/templates', async (req, res) => {
    try {
        const template = new CampaignTemplate(req.body);
        await template.save();
        res.status(201).json(template);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/campaigns/templates/:id', async (req, res) => {
    try {
        const template = await CampaignTemplate.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        );
        if (!template) return res.status(404).json({ message: 'Template not found' });
        res.json(template);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/campaigns/templates/:id', async (req, res) => {
    try {
        await CampaignTemplate.findByIdAndDelete(req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Campaigns ────────────────────────────────────────────────────────────────

// Simple in-memory store for campaigns (replace with a Campaign model in production)
let _campaigns = [];
let _campaignIdCounter = 1;

router.get('/campaigns', (req, res) => {
    try {
        res.json({ items: _campaigns, total: _campaigns.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/campaigns', (req, res) => {
    try {
        const campaign = {
            id: String(_campaignIdCounter++),
            subject: req.body.subject || '',
            html: req.body.html || '',
            status: 'draft',
            sentAt: null,
            recipientCount: 0,
            openedCount: 0,
            createdAt: new Date().toISOString()
        };
        _campaigns.unshift(campaign);
        res.status(201).json(campaign);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.post('/campaigns/:id/send', async (req, res) => {
    try {
        const campaign = _campaigns.find(c => c.id === req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        const total = await Subscriber.countDocuments({ isActive: true });
        campaign.status = 'sent';
        campaign.sentAt = new Date().toISOString();
        campaign.recipientCount = total;
        res.json({ ok: true, queued: total });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/campaigns/:id/resend-non-openers', async (req, res) => {
    try {
        const campaign = _campaigns.find(c => c.id === req.params.id);
        if (!campaign) return res.status(404).json({ message: 'Campaign not found' });
        const nonOpeners = Math.max(0, campaign.recipientCount - campaign.openedCount);
        res.json({ ok: true, queued: nonOpeners });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/campaigns/:id', (req, res) => {
    try {
        _campaigns = _campaigns.filter(c => c.id !== req.params.id);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Subscribers ──────────────────────────────────────────────────────────────

// NOTE: specific paths (export, import) MUST be before /:id param route

router.get('/subscribers/export', async (req, res) => {
    try {
        const subscribers = await Subscriber.find().sort({ createdAt: -1 });
        const header = 'email,name,source,isActive,createdAt';
        const rows = subscribers.map(s => {
            const escape = v => `"${String(v || '').replace(/"/g, '""')}"`;
            return [
                escape(s.email),
                escape(s.name),
                escape(s.source),
                s.isActive ? 'true' : 'false',
                s.createdAt ? new Date(s.createdAt).toISOString() : ''
            ].join(',');
        });
        const csv = [header, ...rows].join('\r\n');
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="subscribers.csv"');
        res.send(csv);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/subscribers/import', async (req, res) => {
    try {
        const raw = typeof req.body === 'string' ? req.body : '';
        if (!raw.trim()) return res.status(400).json({ message: 'Empty CSV body.' });

        const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (!lines.length) return res.status(400).json({ message: 'No rows found in CSV.' });

        const firstLine = lines[0].toLowerCase();
        const hasHeader = firstLine.includes('email');
        const dataLines = hasHeader ? lines.slice(1) : lines;

        let inserted = 0, skipped = 0;
        const errors = [];

        for (const line of dataLines) {
            const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
            const email = cols[0] ? cols[0].toLowerCase() : '';
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { skipped++; continue; }
            const name = cols[1] || '';
            const source = cols[2] || 'csv-import';
            const isActive = cols[3] !== undefined ? cols[3] !== 'false' && cols[3] !== '0' : true;
            try {
                const existing = await Subscriber.findOne({ email });
                if (existing) { skipped++; } else { await Subscriber.create({ email, name, source, isActive }); inserted++; }
            } catch (e) { skipped++; errors.push(email); }
        }

        res.json({ ok: true, inserted, skipped, errors });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/subscribers', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 50, 200);
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.search) {
            query.$or = [
                { email: new RegExp(req.query.search, 'i') },
                { name: new RegExp(req.query.search, 'i') }
            ];
        }
        if (req.query.isActive === 'true') query.isActive = true;
        if (req.query.isActive === 'false') query.isActive = false;

        const [items, total] = await Promise.all([
            Subscriber.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Subscriber.countDocuments(query)
        ]);

        res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
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

// ─── Users ────────────────────────────────────────────────────────────────────

router.get('/users/export', async (req, res) => {
    try {
        const users = await User.find().sort({ createdAt: -1 });
        const header = 'email,name,phone,role,isSuspended,createdAt';
        const rows = users.map(u => {
            const escape = v => `"${String(v || '').replace(/"/g, '""')}"`;
            return [escape(u.email), escape(u.name), escape(u.phone), u.role || 'customer',
            u.isSuspended ? 'true' : 'false',
            u.createdAt ? new Date(u.createdAt).toISOString() : ''].join(',');
        });
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="users.csv"');
        res.send([header, ...rows].join('\r\n'));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/users/import', async (req, res) => {
    try {
        const users = req.body.users || [];
        let created = 0, updated = 0, skipped = 0;
        const errors = [];
        for (const row of users) {
            try {
                const existing = await User.findOne({ email: row.email });
                if (existing) {
                    if (row.name) existing.name = row.name;
                    if (row.phone) existing.phone = row.phone;
                    if (row.role) existing.role = row.role;
                    if (row.isSuspended !== undefined) existing.isSuspended = Boolean(row.isSuspended);
                    await existing.save();
                    updated++;
                } else {
                    await User.create({
                        email: row.email,
                        name: row.name || '',
                        phone: row.phone || '',
                        role: row.role || 'customer',
                        isSuspended: Boolean(row.isSuspended),
                        password: row.password || 'changeme123'
                    });
                    created++;
                }
            } catch (e) {
                errors.push({ rowNumber: row.rowNumber, message: e.message });
                skipped++;
            }
        }
        res.json({ created, updated, skipped, errors });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/users', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const sort = req.query.sort === 'top_spent'
            ? { totalSpent: -1, createdAt: -1 }
            : { createdAt: -1 };

        const query = {};
        if (req.query.search) {
            query.$or = [
                { email: new RegExp(req.query.search, 'i') },
                { name: new RegExp(req.query.search, 'i') }
            ];
        }
        if (req.query.role) query.role = req.query.role;

        const [items, total] = await Promise.all([
            User.find(query).sort(sort).skip(skip).limit(limit).select('-password'),
            User.countDocuments(query)
        ]);

        res.json({ items, page, limit, total, totalPages: Math.ceil(total / limit) });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.get('/users/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/users/:id/role', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        const role = String(req.body.role || '').toLowerCase();
        if (!['admin', 'customer'].includes(role)) return res.status(400).json({ message: 'Invalid role.' });
        user.role = role;
        await user.save();
        res.json({ id: user._id, email: user.email, role: user.role });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/users/:id/suspend', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        user.isSuspended = Boolean(req.body.suspend);
        await user.save();
        res.json({ id: user._id, email: user.email, isSuspended: user.isSuspended });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/users/:id/send-password-reset', async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });
        // Would send actual email in production — stub returns success
        res.json({ ok: true, message: `Password reset link sent to ${user.email}` });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Coupons ──────────────────────────────────────────────────────────────────

let _coupons = [];
let _couponIdCounter = 1;

router.get('/coupons', (req, res) => {
    try {
        let items = [..._coupons];
        if (req.query.isActive === 'true') items = items.filter(c => c.isActive);
        if (req.query.isActive === 'false') items = items.filter(c => !c.isActive);
        res.json({ items, total: items.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/coupons', (req, res) => {
    try {
        const { code, type, value, maxUses, expiresAt, minOrderAmount, appliesTo, isActive } = req.body;
        if (!code || !value) return res.status(400).json({ message: 'Coupon code and value are required.' });
        const existing = _coupons.find(c => c.code === code.toUpperCase());
        if (existing) return res.status(409).json({ message: 'Coupon code already exists.' });
        const coupon = {
            id: String(_couponIdCounter++),
            code: code.trim().toUpperCase(),
            type: type || 'percent',
            value: Number(value),
            maxUses: Number(maxUses) || 0,
            usedCount: 0,
            expiresAt: expiresAt || null,
            minOrderAmount: Number(minOrderAmount) || 0,
            appliesTo: appliesTo || 'both',
            isActive: isActive !== undefined ? Boolean(isActive) : true,
            createdAt: new Date().toISOString()
        };
        _coupons.unshift(coupon);
        res.status(201).json(coupon);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/coupons/:id', (req, res) => {
    try {
        const idx = _coupons.findIndex(c => c.id === req.params.id);
        if (idx === -1) return res.status(404).json({ message: 'Coupon not found' });
        _coupons[idx] = { ..._coupons[idx], ...req.body };
        res.json(_coupons[idx]);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/coupons/:id', (req, res) => {
    try {
        const idx = _coupons.findIndex(c => c.id === req.params.id);
        if (idx === -1) return res.status(404).json({ message: 'Coupon not found' });
        _coupons.splice(idx, 1);
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Financial Summary (stub) ──────────────────────────────────────────────────

router.get('/financial/summary', async (req, res) => {
    try {
        const Order = require('../models/Order');
        const orders = await Order.find().select('total fulfillmentStatus createdAt');
        const now = Date.now();
        let gmv = 0, monthlyMap = {};
        orders.forEach(o => {
            const total = Number(o.total || 0);
            gmv += total;
            const month = new Date(o.createdAt).toISOString().slice(0, 7);
            if (!monthlyMap[month]) monthlyMap[month] = { month, orders: 0, gmv: 0, netRevenue: 0, fees: 0 };
            monthlyMap[month].orders++;
            monthlyMap[month].gmv += total;
            monthlyMap[month].netRevenue += total * 0.95;
            monthlyMap[month].fees += total * 0.05;
        });
        res.json({
            gmv,
            netRevenue: gmv * 0.95,
            feesCollected: gmv * 0.05,
            conversionRate: 0,
            avgAuctionUplift: 0,
            walletBalances: { total: 0, locked: 0 },
            monthlyReport: Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// ─── Wallets (stub) ───────────────────────────────────────────────────────────

router.get('/wallets', (req, res) => {
    res.json({ items: [], total: 0, page: 1, limit: 20, totalPages: 1 });
});

// ─── Reservations (stub) ──────────────────────────────────────────────────────

router.get('/reservations', (req, res) => {
    res.json({ active: [], expired: [], consumed: [] });
});

// ─── Disputes (stub) ──────────────────────────────────────────────────────────

router.get('/disputes', (req, res) => {
    res.json({ items: [], total: 0, page: 1, limit: 50, totalPages: 1 });
});

router.patch('/disputes/:id', (req, res) => {
    res.json({ id: req.params.id, ...req.body });
});

// ─── Email Templates (stub) ───────────────────────────────────────────────────

let _emailTemplates = [];
let _smtpSettings = { enabled: false, host: '', port: 465, secure: true, username: '', hasPassword: false, passwordMasked: '', fromEmail: '', fromName: '', replyTo: '', ignoreTLS: false };

router.get('/email-templates', (req, res) => {
    res.json({ items: _emailTemplates });
});

router.post('/email-templates', (req, res) => {
    try {
        const t = { key: req.body.key, subjectTemplate: req.body.subjectTemplate || '', htmlTemplate: req.body.htmlTemplate || '', isActive: true };
        const existing = _emailTemplates.findIndex(x => x.key === t.key);
        if (existing >= 0) { _emailTemplates[existing] = t; } else { _emailTemplates.push(t); }
        res.status(201).json(t);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/email-templates/transport/smtp', (req, res) => {
    res.json(_smtpSettings);
});

router.put('/email-templates/transport/smtp', (req, res) => {
    const p = req.body;
    if (p.password) { _smtpSettings.hasPassword = true; _smtpSettings.passwordMasked = '••••••••'; }
    _smtpSettings = { ..._smtpSettings, ...p, password: undefined };
    res.json(_smtpSettings);
});

router.post('/email-templates/transport/smtp/test', (req, res) => {
    res.json({ ok: true, message: `Test email would be sent to ${req.body.to}` });
});

router.get('/email-templates/:key', (req, res) => {
    const t = _emailTemplates.find(x => x.key === req.params.key);
    if (!t) return res.status(404).json({ message: 'Template not found' });
    res.json(t);
});

router.put('/email-templates/:key', (req, res) => {
    const idx = _emailTemplates.findIndex(x => x.key === req.params.key);
    if (idx >= 0) {
        _emailTemplates[idx] = { ..._emailTemplates[idx], ...req.body };
        res.json(_emailTemplates[idx]);
    } else {
        const t = { key: req.params.key, ...req.body };
        _emailTemplates.push(t);
        res.json(t);
    }
});

router.post('/email-templates/:key/preview', (req, res) => {
    const t = _emailTemplates.find(x => x.key === req.params.key);
    if (!t) return res.status(404).json({ message: 'Template not found' });
    res.json({ subject: t.subjectTemplate, html: t.htmlTemplate });
});

router.post('/email-templates/:key/test-send', (req, res) => {
    res.json({ ok: true, message: `Test email would be sent to ${req.body.email}` });
});

// ─── Courier (stub) ───────────────────────────────────────────────────────────

let _courierSettings = { provider: 'steadfast', enabled: false, baseUrl: 'https://portal.packzy.com/api/v1', apiKey: '', hasSecret: false, secretKeyMasked: '', fraudCheckerEnabled: false, fraudCheckerEmail: '', fraudCheckerHasPassword: false, fraudCheckerPasswordMasked: '', defaultDeliveryType: 0, defaultItemDescription: 'BidnSteal order' };

router.get('/courier/steadfast/settings', (req, res) => {
    res.json(_courierSettings);
});

router.put('/courier/steadfast/settings', (req, res) => {
    const p = req.body;
    if (p.secretKey) { _courierSettings.hasSecret = true; _courierSettings.secretKeyMasked = '••••••••'; }
    if (p.fraudCheckerPassword) { _courierSettings.fraudCheckerHasPassword = true; _courierSettings.fraudCheckerPasswordMasked = '••••••••'; }
    _courierSettings = { ..._courierSettings, ...p, secretKey: undefined, fraudCheckerPassword: undefined };
    res.json(_courierSettings);
});

router.get('/courier/steadfast/balance', (req, res) => {
    res.json({ currentBalance: 0, currency: 'BDT' });
});

router.post('/courier/steadfast/orders/:id/create', (req, res) => {
    res.status(501).json({ message: 'Courier integration not configured. Add Steadfast API credentials in Settings.' });
});

router.post('/courier/steadfast/orders/:id/sync-status', (req, res) => {
    res.status(501).json({ message: 'Courier integration not configured.' });
});

module.exports = router;

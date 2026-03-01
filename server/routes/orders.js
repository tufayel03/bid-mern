const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.status) query.fulfillmentStatus = req.query.status;
        if (req.query.paymentStatus) query.paymentStatus = req.query.paymentStatus;

        const items = await Order.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Order.countDocuments(query);

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

router.get('/:id', async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.patch('/:id/status', async (req, res) => {
    try {
        const update = {};
        if (req.body.paymentStatus) update.paymentStatus = req.body.paymentStatus;
        if (req.body.fulfillmentStatus) update.fulfillmentStatus = req.body.fulfillmentStatus;
        if (req.body.customerNote !== undefined) update.customerNote = req.body.customerNote;
        if (req.body.shippingAddress && typeof req.body.shippingAddress === 'object') {
            update.shippingAddress = req.body.shippingAddress;
        }

        const order = await Order.findByIdAndUpdate(req.params.id, update, { new: true });
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json(order);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const order = await Order.findByIdAndDelete(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        res.json({ ok: true });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

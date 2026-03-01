const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.trash === 'true') {
            query.deletedAt = { $ne: null };
        } else {
            query.$or = [
                { deletedAt: null },
                { deletedAt: { $exists: false } }
            ];
        }
        if (req.query.search) {
            query.$and = query.$and || [];
            query.$and.push({
                $or: [
                    { title: new RegExp(req.query.search, 'i') },
                    { sku: new RegExp(req.query.search, 'i') }
                ]
            });
        }
        if (req.query.saleMode && req.query.saleMode !== 'All Sale Modes') {
            query.saleMode = req.query.saleMode;
        }

        const items = await Product.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Product.countDocuments(query);

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

router.post('/', async (req, res) => {
    try {
        const product = new Product(req.body);
        if (!product.slug) {
            product.slug = product.title.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Date.now().toString().slice(-4);
        }
        await product.save();
        res.status(201).json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.put('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// PATCH — same as PUT but for partial updates (used by admin panel frontend)
router.patch('/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: false });
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.deletedAt = new Date();
        await product.save();

        res.json({ ok: true, message: 'Product moved to trash' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.post('/:id/restore', async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        product.deletedAt = null;
        await product.save();

        res.json({ ok: true, message: 'Product restored' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id/hard', async (req, res) => {
    try {
        const product = await Product.findByIdAndDelete(req.params.id);
        if (!product) return res.status(404).json({ message: 'Product not found' });
        res.json({ ok: true, message: 'Product permanently deleted' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

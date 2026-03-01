const express = require('express');
const router = express.Router();
const Auction = require('../models/Auction');
const Product = require('../models/Product');

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const items = await Auction.find()
            .populate('productId', 'title images slug')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Auction.countDocuments();

        // Transform for frontend
        const formatted = items.map(a => {
            const doc = a.toObject();
            // Frontend expects 'product' object
            doc.product = doc.productId ? {
                id: doc.productId._id,
                slug: doc.productId.slug,
                title: doc.productId.title,
                image: doc.productId.images?.[0] || ""
            } : null;

            const now = Date.now();
            const end = new Date(doc.endAt).getTime();
            doc.timeLeftMs = Math.max(0, end - now);
            return doc;
        });

        res.json({
            items: formatted,
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
        const product = await Product.findById(req.body.productId);
        if (!product) return res.status(404).json({ message: 'Product not found' });

        const existing = await Auction.findOne({ productId: product._id });
        if (existing) return res.status(400).json({ message: 'Auction already exists for this product.' });

        const auction = new Auction({
            ...req.body,
            currentPrice: req.body.startingPrice
        });
        await auction.save();
        res.status(201).json(auction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});


router.put('/:id', async (req, res) => {
    try {
        const auction = await Auction.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.json(auction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

router.get('/:id', async (req, res) => {
    try {
        // Allow lookup by productId (slug or ObjectId) as well as auction _id
        let auction = null;
        if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
            auction = await Auction.findById(req.params.id).populate('productId', 'title images slug');
            if (!auction) {
                // Maybe it's a productId
                auction = await Auction.findOne({ productId: req.params.id }).populate('productId', 'title images slug');
            }
        }
        if (!auction) {
            // Try finding by product slug
            const product = await Product.findOne({ slug: req.params.id });
            if (product) {
                auction = await Auction.findOne({ productId: product._id }).populate('productId', 'title images slug');
            }
        }
        if (!auction) return res.status(404).json({ message: 'Auction not found' });

        const doc = auction.toObject();
        doc.product = doc.productId ? {
            id: doc.productId._id,
            slug: doc.productId.slug,
            title: doc.productId.title,
            image: doc.productId.images?.[0] || ''
        } : null;
        const now = Date.now();
        doc.timeLeftMs = Math.max(0, new Date(doc.endAt).getTime() - now);
        res.json(doc);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const allowedFields = ['status', 'startAt', 'endAt', 'startingPrice', 'reservePrice', 'minIncrement'];
        const update = {};
        allowedFields.forEach(f => { if (req.body[f] !== undefined) update[f] = req.body[f]; });

        let auction = null;
        if (/^[0-9a-fA-F]{24}$/.test(req.params.id)) {
            auction = await Auction.findByIdAndUpdate(req.params.id, update, { new: true });
            if (!auction) {
                auction = await Auction.findOneAndUpdate({ productId: req.params.id }, update, { new: true });
            }
        }
        if (!auction) {
            const product = await Product.findOne({ slug: req.params.id });
            if (product) {
                auction = await Auction.findOneAndUpdate({ productId: product._id }, update, { new: true });
            }
        }
        if (!auction) return res.status(404).json({ message: 'Auction not found' });
        res.json(auction);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;

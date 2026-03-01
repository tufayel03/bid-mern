const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Media = require('../models/Media');

// Configure Multer for local disk storage
const uploadDir = path.join(__dirname, '..', '..', 'shared', 'uploads', 'media');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
});

const upload = multer({ storage: storage, limits: { fileSize: 5 * 1024 * 1024 } }); // 5MB limit

router.get('/', async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 20;
        const skip = (page - 1) * limit;

        const query = {};
        if (req.query.search) {
            query.fileName = new RegExp(req.query.search, 'i');
        }

        const items = await Media.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Media.countDocuments(query);

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

router.post('/upload', upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file provided' });
        }

        // The public URL mapping. Needs to match express.static in index.js
        const pubUrl = `/uploads/media/${req.file.filename}`;

        const media = new Media({
            fileName: req.file.originalname,
            size: req.file.size,
            url: pubUrl,
            templateTag: `{{media.${req.file.filename.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}}}`
        });

        await media.save();
        res.status(201).json(media);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        let media;

        // Try finding by ObjectId first if it looks like one
        const isObjectId = /^[0-9a-fA-F]{24}$/.test(id);
        if (isObjectId) {
            media = await Media.findById(id);
        }

        // If not found by ID (or not an ID), try finding by fileName
        if (!media) {
            media = await Media.findOne({ fileName: id });
        }

        if (!media) {
            return res.status(404).json({ message: 'Media not found' });
        }

        // Resolve file path safely
        // item.url usually looks like /uploads/media/filename.ext
        const urlPath = media.url.startsWith('/') ? media.url : `/${media.url}`;
        const filePath = path.join(__dirname, '..', '..', 'shared', urlPath);

        if (fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (unlinkErr) {
                console.error(`Failed to delete file: ${filePath}`, unlinkErr);
            }
        }

        await Media.deleteOne({ _id: media._id });
        res.json({ ok: true });
    } catch (err) {
        console.error('Delete media error:', err);
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;

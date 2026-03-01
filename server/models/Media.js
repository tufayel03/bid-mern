const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
    fileName: { type: String, required: true, unique: true },
    size: { type: Number, default: 0 },
    url: { type: String, required: true },
    templateTag: { type: String, required: true },
    deletedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Media', mediaSchema);

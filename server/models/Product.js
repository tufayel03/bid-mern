const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    slug: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    price: { type: Number, required: true, default: 0 },
    sku: { type: String, required: true },
    stock: { type: Number, required: true, default: 0 },
    condition: { type: String, default: 'carded' },
    saleMode: { type: String, enum: ['fixed', 'auction', 'hybrid'], default: 'fixed' },
    series: { type: String, default: '' },
    images: [{ type: String }],
    tags: [{ type: String }],
    description: { type: String, default: '' },
    isFeatured: { type: Boolean, default: false },
    isNewDrop: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);

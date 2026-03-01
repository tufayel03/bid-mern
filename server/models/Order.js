const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    orderNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    paymentMethod: { type: String, default: 'cod' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    fulfillmentStatus: { type: String, enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], default: 'pending' },
    customerNote: { type: String, default: '' },
    subtotal: { type: Number, required: true, default: 0 },
    shippingFee: { type: Number, required: true, default: 0 },
    discount: { type: Number, required: true, default: 0 },
    total: { type: Number, required: true, default: 0 },
    items: [{
        productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
        titleSnapshot: { type: String },
        qty: { type: Number, default: 1 },
        unitPrice: { type: Number, default: 0 },
        type: { type: String, default: 'fixed' },
        imageUrl: { type: String }
    }],
    shippingAddress: {
        fullName: { type: String },
        phone: { type: String },
        addressLine1: { type: String },
        addressLine2: { type: String, default: '' },
        area: { type: String, default: '' },
        city: { type: String },
        postalCode: { type: String },
        country: { type: String, default: 'BD' }
    },
    courier: {
        provider: { type: String, default: 'steadfast' },
        trackingCode: { type: String, default: null },
        consignmentId: { type: String, default: null },
        statusCode: { type: String, default: null },
        deliveryStatus: { type: String, default: null }
    }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);

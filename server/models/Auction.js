const mongoose = require('mongoose');

const auctionSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    status: { type: String, enum: ['scheduled', 'live', 'ended', 'cancelled'], default: 'scheduled' },
    startAt: { type: Date, required: true },
    endAt: { type: Date, required: true },
    endedAt: { type: Date, default: null },
    startingPrice: { type: Number, required: true },
    currentPrice: { type: Number, required: true },
    reservePrice: { type: Number, default: null },
    reservePriceReached: { type: Boolean, default: false },
    minIncrement: { type: Number, default: 1 },
    totalBids: { type: Number, default: 0 },
    lastBidAt: { type: Date, default: null },
    highestBid: {
        bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        bidderName: { type: String, default: null },
        bidderEmail: { type: String, default: null },
        amount: { type: Number, default: null },
        at: { type: Date, default: null }
    },
    winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    bids: [{
        bidderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        amount: { type: Number },
        at: { type: Date }
    }]
}, { timestamps: true });

module.exports = mongoose.model('Auction', auctionSchema);

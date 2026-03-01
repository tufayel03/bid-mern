// Campaign templates schema
const mongoose = require('mongoose');

const campaignTemplateSchema = new mongoose.Schema({
    name: { type: String, required: true },
    subject: { type: String, required: true },
    html: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('CampaignTemplate', campaignTemplateSchema);

// models/Highlight.js
const mongoose = require('mongoose');

const HighlightSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium', required: true },
  date: { type: String, required: true }
});

module.exports = mongoose.model('Highlight', HighlightSchema);
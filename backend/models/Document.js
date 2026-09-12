const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, required: true },
  uploadedBy: { type: String, default: 'Admin' },
  date: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileId: { type: mongoose.Schema.Types.ObjectId, required: true },
  mimeType: { type: String, required: true }
});

module.exports = mongoose.model('Document', DocumentSchema);
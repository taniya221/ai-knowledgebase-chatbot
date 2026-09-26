const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  siteName: { type: String, default: 'KnoAI Dashboard' },
  adminEmail: { type: String, default: 'admin@knoai.com' },
  maintenanceMode: { type: Boolean, default: false }
});

module.exports = mongoose.model('Setting', SettingSchema);
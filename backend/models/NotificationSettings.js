
const mongoose = require("mongoose");

const notificationSettingsSchema = new mongoose.Schema({
  newDocumentNotification: {
    type: Boolean,
    default: true,
  },
  userNotification: {
    type: Boolean,
    default: true,
  },
  systemNotification: {
    type: Boolean,
    default: true,
  },
});

module.exports = mongoose.model(
  "NotificationSettings",
  notificationSettingsSchema
);

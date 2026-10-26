const mongoose = require("mongoose");

const systemSettingsSchema = new mongoose.Schema(
  {
    notificationSettings: {
      newDocumentNotification: {
        type: Boolean,
        default: true,
      },

      userRegistrationNotification: {
        type: Boolean,
        default: true,
      },

      systemUpdates: {
        type: Boolean,
        default: true,
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model(
  "SystemSettings",
  systemSettingsSchema
);
const mongoose = require("mongoose");

const SettingSchema = new mongoose.Schema(
  {
    // =========================
    // GENERAL
    // =========================

    siteName: {
      type: String,
      default: "InfoHub",
    },

    tagline: {
      type: String,
      default: "Your Intelligent Knowledge Assistant",
    },

    description: {
      type: String,
      default:
        "An AI-powered knowledge base that helps you find information from your documents, with source references and daily updates.",
    },

    // =========================
    // ADMIN PROFILE
    // =========================

    adminEmail: {
      type: String,
      default: "admin@knoai.com",
    },

    // =========================
    // MAINTENANCE
    // =========================

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    // =========================
    // USER REGISTRATION
    // =========================

    allowRegistration: {
      type: Boolean,
      default: true,
    },

    // =========================
    // APPEARANCE
    // =========================

    primaryColor: {
      type: String,
      default: "purple",
    },

    theme: {
      type: String,
      default: "light",
    },

    // =========================
    // SECURITY
    // =========================

    twoFactor: {
      type: Boolean,
      default: false,
    },

    // =========================
    // NOTIFICATIONS
    // =========================

    notifications: {
      document: {
        type: Boolean,
        default: true,
      },

      highlight: {
        type: Boolean,
        default: true,
      },

      user: {
        type: Boolean,
        default: false,
      },

      system: {
        type: Boolean,
        default: true,
      },
    },

    // =========================
    // LOGO
    // =========================

    logoUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Setting", SettingSchema);
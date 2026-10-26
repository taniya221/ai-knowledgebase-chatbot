const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    sender: {
      type: String,
      enum: ["user", "bot"],
      required: true,
    },

    text: {
      type: String,
      required: true,
    },

    source: {
      type: String,
      default: null,
    },

    time: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

const ConversationSchema =
  new mongoose.Schema(
    {
      chatId: {
        type: String,
        required: true,
        unique: true,
      },

      title: {
        type: String,
        default: "New Chat",
      },

      messages: {
        type: [MessageSchema],
        default: [],
      },
    },
    {
      timestamps: true,
    }
  );

module.exports =
  mongoose.model(
    "Conversation",
    ConversationSchema
  );
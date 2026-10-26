
const express = require("express");
const router = express.Router();
const ContactMessage = require("../models/ContactMessage");

// Save a new contact message
router.post("/", async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and message are required.",
      });
    }

    const savedMessage = await ContactMessage.create({
      name,
      email,
      subject,
      message,
    });

    res.status(201).json({
      success: true,
      message: "Message submitted successfully.",
      data: savedMessage,
    });
  } catch (error) {
    console.error("Save contact message error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save contact message.",
    });
  }
});

// Get all contact messages
router.get("/", async (req, res) => {
  try {
    const messages = await ContactMessage.find().sort({
      createdAt: -1,
    });

    res.json({ success: true, messages });
  } catch (error) {
    console.error("Load contact messages error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to load contact messages.",
    });
  }
});

// Update message status
router.patch("/:id/status", async (req, res) => {
  try {
    const { status } = req.body;

    if (!["unread", "read", "resolved"].includes(status)) {
      return res.status(400).json({
        message: "Invalid message status.",
      });
    }

    const message = await ContactMessage.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!message) {
      return res.status(404).json({
        message: "Contact message not found.",
      });
    }

    res.json({ message });
  } catch (error) {
    console.error("Update contact status error:", error);
    res.status(500).json({
      message: "Failed to update contact status.",
    });
  }
});

// Delete a contact message
router.delete("/:id", async (req, res) => {
  try {
    const message = await ContactMessage.findByIdAndDelete(
      req.params.id
    );

    if (!message) {
      return res.status(404).json({
        message: "Contact message not found.",
      });
    }

    res.json({
      success: true,
      message: "Contact message deleted successfully.",
    });
  } catch (error) {
    console.error("Delete contact message error:", error);
    res.status(500).json({
      message: "Failed to delete contact message.",
    });
  }
});

module.exports = router;


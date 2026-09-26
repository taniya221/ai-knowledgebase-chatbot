
const mongoose = require("mongoose");

const DocumentChunkSchema = new mongoose.Schema({
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Document",
    required: true,
  },

  documentName: {
    type: String,
    required: true,
  },

  text: {
    type: String,
    required: true,
  },

  chunkIndex: {
    type: Number,
    required: true,
  },
});

module.exports = mongoose.model("DocumentChunk", DocumentChunkSchema);


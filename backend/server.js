

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dns = require("dns");

const mongoose = require("mongoose");

// PDF parser - pdf-parse v2.4.5
const { PDFParse } = require("pdf-parse");

// PPTX parser
const PPTX2Json = require("pptx2json");

// Models
const Document = require("./models/Document");
const DocumentChunk = require("./models/DocumentChunk");
const Highlight = require("./models/Highlight");
const User = require("./models/User");

// ======================================================
// DNS
// ======================================================

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// ======================================================
// APP
// ======================================================

const app = express();

app.use(cors());
app.use(express.json());

// ======================================================
// UPLOAD FOLDER
// ======================================================

const uploadDir = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Allow browser to access uploaded files
app.use("/uploads", express.static(uploadDir));

// ======================================================
// MULTER CONFIGURATION
// ======================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      file.originalname.replace(/[^a-zA-Z0-9.-]/g, "_");

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,
});

// ======================================================
// MONGODB CONNECTION
// ======================================================

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("MONGODB_URI is missing in .env file");
  process.exit(1);
}

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
  });

// ======================================================
// CREATE TEXT CHUNKS
// ======================================================

function createChunks(text, chunkSize = 1000) {
  if (!text) {
    return [];
  }

  const cleanedText = text
    .replace(/\r/g, " ")
    .replace(/\n+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleanedText) {
    return [];
  }

  const chunks = [];

  for (let i = 0; i < cleanedText.length; i += chunkSize) {
    chunks.push(cleanedText.substring(i, i + chunkSize));
  }

  return chunks;
}

// ======================================================
// PDF TEXT EXTRACTION
// pdf-parse v2.4.5
// ======================================================

async function extractPdfText(filePath) {
  let parser = null;

  try {
    console.log("================================");
    console.log("Reading PDF:");
    console.log(filePath);

    const dataBuffer = fs.readFileSync(filePath);

    console.log("PDF size:", dataBuffer.length, "bytes");

    // pdf-parse v2 API
    parser = new PDFParse({
      data: dataBuffer,
    });

    const result = await parser.getText();

    const extractedText = result.text || "";

    console.log("PDF text extracted successfully.");
    console.log("Extracted characters:", extractedText.length);

    return extractedText.trim();
  } catch (error) {
    console.error("PDF extraction error:", error);
    return "";
  } finally {
    if (parser) {
      try {
        await parser.destroy();
      } catch (destroyError) {
        console.error("PDF parser destroy error:", destroyError);
      }
    }
  }
}

// ======================================================
// PPTX TEXT EXTRACTION
// ======================================================

async function extractPptxText(filePath) {
  try {
    console.log("================================");
    console.log("Reading PPTX:");
    console.log(filePath);

    // pptx2json API
    const pptxParser = new PPTX2Json();

    const result = await pptxParser.toJson(filePath);

    let extractedText = "";

    function collectText(value) {
      if (value === null || value === undefined) {
        return;
      }

      if (typeof value === "string") {
        const cleaned = value.trim();

        if (cleaned) {
          extractedText += cleaned + "\n";
        }

        return;
      }

      if (typeof value === "number" || typeof value === "boolean") {
        return;
      }

      if (Array.isArray(value)) {
        value.forEach((item) => {
          collectText(item);
        });

        return;
      }

      if (typeof value === "object") {
        Object.keys(value).forEach((key) => {
          collectText(value[key]);
        });
      }
    }

    collectText(result);

    extractedText = extractedText
      .replace(/\s+/g, " ")
      .trim();

    console.log(
      "PPTX text extracted successfully."
    );

    console.log(
      "Extracted characters:",
      extractedText.length
    );

    return extractedText;
  } catch (error) {
    console.error("PPTX extraction error:", error);
    return "";
  }
}

// ======================================================
// HEALTH CHECK
// ======================================================

app.get("/", (req, res) => {
  res.json({
    message: "InfoHub backend is running",
  });
});

// ======================================================
// LOGIN
// ======================================================

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    // ------------------------------
    // ADMIN LOGIN
    // ------------------------------

    if (
      email === "admin@knoai.com" &&
      password === "admin123"
    ) {
      return res.json({
        message: "Admin login successful",
        name: "Admin",
        email: email,
        role: "Admin",
      });
    }

    // ------------------------------
    // NORMAL USER LOGIN
    // ------------------------------

    const user = await User.findOne({
      email: email,
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    res.json({
      message: "Login successful",
      name: user.name,
      email: user.email,
      role: user.role || "Student",
    });
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Server error during login",
    });
  }
});

// ======================================================
// SIGNUP
// ======================================================

app.post("/api/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    const existingUser = await User.findOne({
      email: email,
    });

    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    const newUser = new User({
      name: name,
      email: email,
      password: password,
      role: role || "Student",
      joinedOn: new Date().toLocaleDateString(),
    });

    await newUser.save();

    res.status(201).json({
      message: "Signup successful",
    });
  } catch (error) {
    console.error("Signup error:", error);

    res.status(500).json({
      message: "Server error during signup",
    });
  }
});

// ======================================================
// GET ALL DOCUMENTS
// ======================================================

app.get("/api/documents", async (req, res) => {
  try {
    const documents = await Document.find().sort({
      _id: -1,
    });

    res.json(documents);
  } catch (error) {
    console.error("Get documents error:", error);

    res.status(500).json({
      message: "Failed to fetch documents",
    });
  }
});

// ======================================================
// UPLOAD DOCUMENT
// ======================================================

app.post(
  "/api/documents",
  upload.single("file"),
  async (req, res) => {
    try {
      console.log("================================");
      console.log("DOCUMENT UPLOAD STARTED");

      if (!req.file) {
        return res.status(400).json({
          message: "No file uploaded",
        });
      }

      console.log(
        "File received:",
        req.file.originalname
      );

      console.log(
        "MIME type:",
        req.file.mimetype
      );

      console.log(
        "File path:",
        req.file.path
      );

      // ==================================================
      // CREATE DOCUMENT RECORD
      // ==================================================

      const fileId = new mongoose.Types.ObjectId();

      const newDoc = new Document({
        name: req.file.originalname,

        type: path
          .extname(req.file.originalname)
          .replace(".", "")
          .toUpperCase(),

        uploadedBy: "Admin",

        date: new Date().toLocaleDateString(),

        fileUrl:
          "/uploads/" + req.file.filename,

        fileId: fileId,

        mimeType: req.file.mimetype,
      });

      await newDoc.save();

      console.log(
        "Document saved to MongoDB"
      );

      console.log(
        "Document ID:",
        newDoc._id
      );

      // ==================================================
      // EXTRACT TEXT
      // ==================================================

      let extractedText = "";

      // ------------------------------
      // PDF
      // ------------------------------

      if (
        req.file.mimetype === "application/pdf"
      ) {
        console.log("PDF detected.");

        extractedText =
          await extractPdfText(
            req.file.path
          );
      }

      // ------------------------------
      // PPTX
      // ------------------------------

      else if (
        req.file.mimetype ===
        "application/vnd.openxmlformats-officedocument.presentationml.presentation"
      ) {
        console.log("PPTX detected.");

        extractedText =
          await extractPptxText(
            req.file.path
          );
      }

      // ------------------------------
      // TXT
      // ------------------------------

      else if (
        req.file.mimetype === "text/plain"
      ) {
        console.log("TXT detected.");

        try {
          extractedText =
            fs.readFileSync(
              req.file.path,
              "utf8"
            );

          console.log(
            "TXT text extracted successfully."
          );
        } catch (error) {
          console.error(
            "TXT extraction error:",
            error
          );

          extractedText = "";
        }
      }

      // ------------------------------
      // UNSUPPORTED FILE
      // ------------------------------

      else {
        console.log(
          "Unsupported file type:",
          req.file.mimetype
        );
      }

      // ==================================================
      // CREATE CHUNKS
      // ==================================================

      if (
        extractedText &&
        extractedText.trim().length > 0
      ) {
        console.log(
          "Text extracted successfully."
        );

        console.log(
          "Text length:",
          extractedText.length
        );

        const chunks =
          createChunks(
            extractedText,
            1000
          );

        console.log(
          "Chunks created:",
          chunks.length
        );

        // ==================================================
        // SAVE CHUNKS
        // ==================================================

        for (
          let i = 0;
          i < chunks.length;
          i++
        ) {
          const chunk =
            new DocumentChunk({
              documentId:
                newDoc._id,

              documentName:
                newDoc.name,

              text: chunks[i],

              chunkIndex: i,
            });

          await chunk.save();
        }

        console.log(
          "Document chunks saved to MongoDB."
        );
      } else {
        console.log(
          "No text extracted."
        );

        console.log(
          "No chunks were created."
        );
      }

      console.log(
        "DOCUMENT UPLOAD COMPLETED"
      );

      console.log("================================");

      res.status(201).json({
        message:
          "Document uploaded successfully",

        document: newDoc,

        textExtracted:
          extractedText.length > 0,

        textLength:
          extractedText.length,
      });
    } catch (error) {
      console.error(
        "DOCUMENT UPLOAD ERROR:",
        error
      );

      // If MongoDB/document save fails,
      // remove uploaded physical file
      if (req.file) {
        try {
          if (
            fs.existsSync(
              req.file.path
            )
          ) {
            fs.unlinkSync(
              req.file.path
            );
          }
        } catch (fileError) {
          console.error(
            "Uploaded file cleanup error:",
            fileError
          );
        }
      }

      res.status(500).json({
        message:
          "Document upload failed",

        error:
          error.message,
      });
    }
  }
);

// ======================================================
// DELETE DOCUMENT
// ======================================================

app.delete(
  "/api/documents/:id",
  async (req, res) => {
    try {
      const document =
        await Document.findById(
          req.params.id
        );

      if (!document) {
        return res.status(404).json({
          message: "Document not found",
        });
      }

      // ----------------------------------------------
      // Delete chunks
      // ----------------------------------------------

      await DocumentChunk.deleteMany({
        documentId:
          document._id,
      });

      console.log(
        "Document chunks deleted"
      );

      // ----------------------------------------------
      // Delete physical file
      // ----------------------------------------------

      if (document.fileUrl) {
        const filename =
          path.basename(
            document.fileUrl
          );

        const physicalPath =
          path.join(
            uploadDir,
            filename
          );

        if (
          fs.existsSync(
            physicalPath
          )
        ) {
          fs.unlinkSync(
            physicalPath
          );

          console.log(
            "Physical file deleted"
          );
        }
      }

      // ----------------------------------------------
      // Delete MongoDB document
      // ----------------------------------------------

      await Document.findByIdAndDelete(
        req.params.id
      );

      console.log(
        "Document deleted from MongoDB"
      );

      res.json({
        message:
          "Document deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete document error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete document",
      });
    }
  }
);

// ======================================================
// GET HIGHLIGHTS
// ======================================================

app.get(
  "/api/highlights",
  async (req, res) => {
    try {
      const highlights =
        await Highlight.find().sort({
          _id: -1,
        });

      res.json(highlights);
    } catch (error) {
      console.error(
        "Get highlights error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to fetch highlights",
      });
    }
  }
);

// ======================================================
// ADD HIGHLIGHT
// ======================================================

app.post(
  "/api/highlights",
  async (req, res) => {
    try {
      const {
        title,
        description,
      } = req.body;

      if (!title || !description) {
        return res.status(400).json({
          message:
            "Title and description are required",
        });
      }

      const highlight =
        new Highlight({
          title: title,
          description:
            description,

          date:
            new Date().toLocaleDateString(),
        });

      await highlight.save();

      res.status(201).json({
        message:
          "Highlight added successfully",

        highlight:
          highlight,
      });
    } catch (error) {
      console.error(
        "Add highlight error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to add highlight",
      });
    }
  }
);

// ======================================================
// DELETE HIGHLIGHT
// ======================================================

app.delete(
  "/api/highlights/:id",
  async (req, res) => {
    try {
      const highlight =
        await Highlight.findById(
          req.params.id
        );

      if (!highlight) {
        return res.status(404).json({
          message:
            "Highlight not found",
        });
      }

      await Highlight.findByIdAndDelete(
        req.params.id
      );

      res.json({
        message:
          "Highlight deleted successfully",
      });
    } catch (error) {
      console.error(
        "Delete highlight error:",
        error
      );

      res.status(500).json({
        message:
          "Failed to delete highlight",
      });
    }
  }
);

// ======================================================
// CHAT
// ======================================================

app.post(
  "/api/chat",
  async (req, res) => {
    try {
      const {
        question,
        chatId,
      } = req.body;

      console.log(
        "Chat question:",
        question
      );

      if (!question) {
        return res.status(400).json({
          message:
            "Question is required",
        });
      }

      // ------------------------------------------------
      // TEMPORARY RESPONSE
      // ------------------------------------------------
      //
      // Real document-based AI/RAG will be connected
      // after PDF/PPTX extraction and chunk storage
      // are verified.
      //

      res.json({
        answer:
          "Your question was received successfully. The AI Knowledge Base will be connected here.",

        chatId:
          chatId || null,

        source: null,
      });
    } catch (error) {
      console.error(
        "Chat error:",
        error
      );

      res.status(500).json({
        message:
          "Chat request failed",
      });
    }
  }
);

// ======================================================
// ERROR HANDLER
// ======================================================

app.use(
  (
    err,
    req,
    res,
    next
  ) => {
    console.error(
      "Unhandled server error:",
      err
    );

    res.status(500).json({
      message:
        "Internal server error",
    });
  }
);

// ======================================================
// START SERVER
// ======================================================

const PORT =
  process.env.PORT || 5000;

app.listen(
  PORT,
  () => {
    console.log(
      "================================"
    );

    console.log(
      `InfoHub backend running on port ${PORT}`
    );

    console.log(
      `http://localhost:${PORT}`
    );

    console.log(
      "================================"
    );
  }
);


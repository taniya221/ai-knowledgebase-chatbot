// =====================================================
// INFOHUB BACKEND SERVER
// =====================================================

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const dns = require("dns");
const mongoose = require("mongoose");

const { PDFParse } = require("pdf-parse");
const Pptx2Json = require("pptx2json");
const { GoogleGenAI, createPartFromUri } = require("@google/genai");

// =====================================================
// MODELS
// =====================================================

const Document = require("./models/Document");
const DocumentChunk = require("./models/DocumentChunk");

const Highlight = require("./models/Highlight");
const User = require("./models/User");
const Conversation = require("./models/Conversation");
const Notification = require("./models/Notification");
const NotificationSettings = require("./models/NotificationSettings");
const contactRoutes = require("./routes/contactRoutes");

// APP CONFIGURATION
const app = express();

const PORT = process.env.PORT || 5000;

// MIDDLEWARE
app.use(cors());
app.use(express.json());

// CONTACT ROUTE
app.use("/api/contact", contactRoutes);


// =====================================================
// DNS
// =====================================================

dns.setServers(["8.8.8.8", "1.1.1.1"]);

// =====================================================
// MONGODB CONNECTION
// =====================================================

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("========================================");
    console.log("MongoDB connected successfully");
    console.log("========================================");
  })
  .catch((error) => {
    console.error("MongoDB connection error:");
    console.error(error);
  });

// =====================================================
// GEMINI CONFIGURATION
// =====================================================

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

// =====================================================
// UPLOAD FOLDER
// =====================================================

const uploadFolder = path.join(__dirname, "uploads");

if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, {
    recursive: true,
  });
}

// =====================================================
// SERVE UPLOADED FILES
// =====================================================

app.use(
  "/uploads",
  express.static(uploadFolder)
);

// =====================================================
// MULTER CONFIGURATION
// =====================================================

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadFolder);
  },

  filename: function (req, file, cb) {
    const uniqueName =
      Date.now() +
      "-" +
      Math.round(Math.random() * 1e9) +
      path.extname(file.originalname);

    cb(null, uniqueName);
  },
});

const upload = multer({
  storage: storage,

  fileFilter: function (req, file, cb) {
    const extension = path
      .extname(file.originalname)
      .toLowerCase();

    const allowedExtensions = [
      ".pdf",
      ".pptx",
      ".txt",
    ];

    if (!allowedExtensions.includes(extension)) {
      return cb(
        new Error(
          "Unsupported file type. Only PDF, PPTX and TXT files are allowed."
        )
      );
    }

    cb(null, true);
  },
});

// =====================================================
// CREATE TEXT CHUNKS
// =====================================================

function createChunks(text, chunkSize = 1000) {
  const chunks = [];

  if (!text) {
    return chunks;
  }

  for (
    let i = 0;
    i < text.length;
    i += chunkSize
  ) {
    const chunk = text
      .slice(i, i + chunkSize)
      .trim();

    if (chunk.length > 0) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

// =====================================================
// CREATE GEMINI EMBEDDING
// =====================================================

async function createEmbedding(text) {
  try {
    console.log(
      "Creating embedding..."
    );

    const response =
      await ai.models.embedContent({
        model: "gemini-embedding-2",

        contents: text,

        config: {
          outputDimensionality: 768,
        },
      });

    if (
      !response ||
      !response.embeddings ||
      !response.embeddings[0] ||
      !response.embeddings[0].values
    ) {
      throw new Error(
        "Gemini did not return a valid embedding"
      );
    }

    const embedding =
      response.embeddings[0].values;

    console.log(
      "Embedding dimensions:",
      embedding.length
    );

    return embedding;
  } catch (error) {
    console.error(
      "Embedding error:",
      error.message
    );

    throw error;
  }
}

// =====================================================
// GEMINI PDF OCR
// =====================================================

async function extractTextFromPdfUsingGemini(filePath) {
  console.log(
    "========================================"
  );

  console.log(
    "STARTING GEMINI PDF OCR"
  );

  console.log(
    "PDF path:",
    filePath
  );

  console.log(
    "========================================"
  );

  let uploadedFile = null;

  try {
    // -----------------------------------------
    // UPLOAD PDF TO GEMINI
    // -----------------------------------------

    console.log(
      "Uploading PDF to Gemini..."
    );

    uploadedFile =
      await ai.files.upload({
        file: filePath,

        config: {
          mimeType: "application/pdf",
        },
      });

    console.log(
      "PDF uploaded to Gemini:"
    );

    console.log(
      "File name:",
      uploadedFile.name
    );

    console.log(
      "File URI:",
      uploadedFile.uri
    );

    console.log(
      "File state:",
      uploadedFile.state
    );

    // -----------------------------------------
    // WAIT UNTIL GEMINI FINISHES PROCESSING
    // -----------------------------------------

    let fileInfo =
      await ai.files.get({
        name: uploadedFile.name,
      });

    let attempts = 0;

    while (
      fileInfo.state === "PROCESSING" &&
      attempts < 30
    ) {
      attempts++;

      console.log(
        `Gemini is processing PDF... attempt ${attempts}/30`
      );

      await new Promise(
        (resolve) =>
          setTimeout(resolve, 2000)
      );

      fileInfo =
        await ai.files.get({
          name: uploadedFile.name,
        });
    }

    console.log(
      "Final Gemini file state:",
      fileInfo.state
    );

    // -----------------------------------------
    // CHECK FILE STATE
    // -----------------------------------------

    if (
      fileInfo.state === "FAILED"
    ) {
      throw new Error(
        "Gemini failed to process the PDF."
      );
    }

    if (
      fileInfo.state !== "ACTIVE"
    ) {
      throw new Error(
        `Gemini PDF is not ready. Current state: ${fileInfo.state}`
      );
    }

    // -----------------------------------------
    // ASK GEMINI TO EXTRACT ALL TEXT
    // -----------------------------------------

    console.log(
      "Asking Gemini to extract PDF text..."
    );

    const prompt = `
Extract all readable text from this PDF.

This PDF may be a scanned/image-based document.

Perform OCR on every page.

Important instructions:

1. Extract the actual text visible in the document.
2. Preserve headings, dates, numbers, names, months, schedules and table information.
3. Do not summarize the document.
4. Do not explain the document.
5. Do not add information that is not visible in the PDF.
6. Keep the original order of the content as much as possible.
7. For tables, preserve the rows and columns using clear text formatting.
8. Include text from every page.
9. Return ONLY the extracted document text.

The extracted text will be stored in a knowledge base and used for question answering.
`;

    const response =
      await ai.models.generateContent({
        model: "gemini-3-flash-preview",

        contents: [
          createPartFromUri(
            fileInfo.uri,
            fileInfo.mimeType
          ),

          prompt,
        ],
      });

    const extractedText =
      response.text || "";

    console.log(
      "Gemini OCR text length:",
      extractedText.length,
      "characters"
    );

    if (
      !extractedText ||
      !extractedText.trim()
    ) {
      throw new Error(
        "Gemini returned empty OCR text."
      );
    }

    console.log(
      "========================================"
    );

    console.log(
      "GEMINI PDF OCR COMPLETED"
    );

    console.log(
      "========================================"
    );

    return extractedText;

  } catch (error) {
    console.error(
      "========================================"
    );

    console.error(
      "GEMINI PDF OCR ERROR"
    );

    console.error(
      "Message:",
      error.message
    );

    console.error(
      "Stack:",
      error.stack
    );

    console.error(
      "========================================"
    );

    throw error;

  } finally {

    // -----------------------------------------
    // DELETE TEMPORARY GEMINI FILE
    // -----------------------------------------

    if (
      uploadedFile &&
      uploadedFile.name
    ) {
      try {
        console.log(
          "Deleting temporary Gemini PDF..."
        );

        await ai.files.delete({
          name: uploadedFile.name,
        });

        console.log(
          "Temporary Gemini PDF deleted."
        );

      } catch (deleteError) {
        console.error(
          "Gemini file cleanup error:",
          deleteError.message
        );
      }
    }
  }
}

// =====================================================
// GENERATE GEMINI ANSWER
// =====================================================

async function generateGeminiAnswer(prompt) {
  const models = [
    "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.1-flash-lite"
    ,
    
  ];

  let lastError = null;

  for (const model of models) {
    for (
      let attempt = 1;
      attempt <= 2;
      attempt++
    ) {
      try {
        console.log(
          "========================================"
        );

        console.log(
          "Trying Gemini model:",
          model
        );

        console.log(
          "Attempt:",
          attempt
        );

        const response =
          await ai.models.generateContent({
            model: model,
            contents: prompt,
          });

        console.log(
          "SUCCESS with model:",
          model
        );

        return response.text;

      } catch (error) {

        lastError = error;

        console.error(
          `Gemini error with ${model}, attempt ${attempt}:`,
          error.message
        );

        const status =
          error?.status ||
          error?.code ||
          error?.response?.status;

        if (
          status === 429 ||
          status === 503 ||
          error.message?.includes("429") ||
          error.message?.includes("503") ||
          error.message?.includes("UNAVAILABLE")
        ) {
          const waitTime =
            attempt * 2000;

          console.log(
            `Waiting ${waitTime}ms before retry...`
          );

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                waitTime
              )
          );

          continue;
        }

        break;
      }
    }
  }

  throw (
    lastError ||
    new Error(
      "Gemini request failed"
    )
  );
}

// =====================================================
// SAVE CONVERSATION
// =====================================================

async function saveConversation(
  chatId,
  question,
  answer,
  source
) {
  try {
    let conversation =
      await Conversation.findOne({
        chatId,
      });

    if (!conversation) {
      conversation =
        new Conversation({
          chatId,

          title:
            question.length > 40
              ? question.substring(
                  0,
                  40
                ) + "..."
              : question,

          messages: [],
        });
    }

    conversation.messages.push({
      sender: "user",
      text: question,
      time: new Date(),
    });

    conversation.messages.push({
      sender: "bot",
      text: answer,
      source: source || null,
      time: new Date(),
    });

    await conversation.save();

    console.log(
      "Conversation saved:",
      chatId
    );

    return conversation;

  } catch (error) {

    console.error(
      "Save conversation error:",
      error
    );

    throw error;
  }
}

// =====================================================
// HOME
// =====================================================

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "InfoHub backend is running",
  });
});

// =====================================================
// HEALTH CHECK
// =====================================================

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message:
      "InfoHub backend is healthy",

    database:
      mongoose.connection.readyState ===
      1
        ? "connected"
        : "disconnected",
  });
});

// =====================================================
// LOGIN
// =====================================================

app.post(
  "/api/login",
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message:
            "Email and password are required",
        });
      }

      // CLEAN EMAIL
      const cleanEmail =
        email.trim().toLowerCase();

      // =================================================
      // ADMIN LOGIN
      // =================================================

      if (
        cleanEmail ===
          "admin@knoai.com" &&
        password === "admin123"
      ) {
        return res.json({
          success: true,

          message:
            "Admin login successful",

          user: {
            id: "admin",
            name: "Admin",
            email: "admin@knoai.com",
            role: "admin",
          },
        });
      }

      // =================================================
      // USER LOGIN
      // =================================================

      const user =
        await User.findOne({
          email: cleanEmail,
        });

      if (!user) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      // CHECK PASSWORD
      if (
        user.password !== password
      ) {
        return res.status(401).json({
          success: false,
          message:
            "Invalid email or password",
        });
      }

      // USER ROLE
      const userRole =
        user.role &&
        user.role.toLowerCase() ===
          "admin"
          ? "admin"
          : "user";

      return res.json({
        success: true,

        message:
          "Login successful",

        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: userRole,
        },
      });

    } catch (error) {

      console.error(
        "Login error:",
        error
      );

      return res.status(500).json({
        success: false,
        message:
          "Server error",
      });
    }
  }
);

async function getNotificationSettings() {
  let settings = await NotificationSettings.findOne();

  if (!settings) {
    settings = await NotificationSettings.create({});
  }

  return settings;
}


// =====================================================
// SIGNUP
// =====================================================

app.post(
  "/api/signup",
  async (req, res) => {
    try {
      const {
        name,
        email,
        password,
      } = req.body;

      if (
        !name ||
        !email ||
        !password
      ) {
        return res.status(400).json({
          success: false,
          message:
            "All fields are required",
        });
      }

      // CLEAN DATA
      const cleanName =
        name.trim();

      const cleanEmail =
        email.trim().toLowerCase();

      // CHECK EXISTING USER
      const existingUser =
        await User.findOne({
          email: cleanEmail,
        });

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message:
            "User already exists",
        });
      }

      // CREATE USER
      const user =
        new User({
          name: cleanName,

          email: cleanEmail,

          password: password,

          role: "user",

          // REQUIRED BY User.js
          joinedOn:
            new Date().toISOString(),
        });

      await user.save();
      
      // CREATE USER REGISTRATION NOTIFICATION
try {
  let settings = await NotificationSettings.findOne();

  if (!settings) {
    settings = await NotificationSettings.create({});
  }

  if (settings.userNotification !== false) {
    await Notification.create({
      type: "user_registration",
      title: "New User Registered",
      message: `${cleanName} (${cleanEmail}) created an InfoHub account.`,
      read: false,
    });

    console.log("User registration notification created.");
  } else {
    console.log("User registration notifications are OFF.");
  }
} catch (notificationError) {
  console.error(
    "Failed to create registration notification:",
    notificationError.message
  );
}

      return res.status(201).json({
        success: true,

        message:
          "Account created successfully",
      });

    } catch (error) {

      console.error(
        "Signup error:",
        error
      );

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Server error",
      });
    }
  }
);

// =====================================================
// DOCUMENT UPLOAD
// =====================================================

app.post(
  "/api/documents/upload",
  upload.single("file"),

  async (req, res) => {
    let uploadedFilePath = null;
    let savedDocument = null;

    try {

      // CHECK FILE

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message:
            "No file uploaded",
        });
      }

      const file = req.file;

      uploadedFilePath =
        file.path;

      console.log(
        "========================================"
      );

      console.log(
        "DOCUMENT UPLOAD STARTED"
      );

      console.log(
        "Original file:",
        file.originalname
      );

      console.log(
        "Stored file:",
        file.filename
      );

      console.log(
        "File path:",
        file.path
      );

      console.log(
        "File size:",
        file.size,
        "bytes"
      );

      console.log(
        "========================================"
      );

      // FILE EXTENSION

      const extension =
        path
          .extname(
            file.originalname
          )
          .toLowerCase();

      let text = "";

      // =====================================================
      // PDF TEXT EXTRACTION + GEMINI OCR
      // =====================================================

      if (extension === ".pdf") {

        console.log(
          "Extracting PDF text..."
        );

        const dataBuffer =
          fs.readFileSync(file.path);

        // -----------------------------------------
        // STEP 1: TRY NORMAL PDF TEXT EXTRACTION
        // -----------------------------------------

        const parser =
          new PDFParse({
            data: dataBuffer,
          });

        const result =
          await parser.getText();

        text =
          result.text || "";

        await parser.destroy();

        console.log(
          "Normal PDF text extracted:",
          text.length,
          "characters"
        );

        // -----------------------------------------
        // STEP 2: GEMINI OCR IF TEXT IS TOO SHORT
        // -----------------------------------------

        if (
          text.trim().length < 200
        ) {

          console.log(
            "PDF text is too short."
          );

          console.log(
            "Starting Gemini OCR..."
          );

          try {

            text =
              await extractTextFromPdfUsingGemini(
                file.path
              );

            console.log(
              "Gemini OCR text extracted:",
              text.length,
              "characters"
            );

          } catch (ocrError) {

            console.error(
              "GEMINI OCR ERROR:",
              ocrError.message
            );

            throw new Error(
              "Could not extract text from PDF using Gemini OCR."
            );
          }
        }
      }

      // =====================================================
      // TXT
      // =====================================================

      else if (
        extension === ".txt"
      ) {

        console.log(
          "Reading TXT file..."
        );

        text =
          fs.readFileSync(
            file.path,
            "utf8"
          );

        console.log(
          "TXT text extracted:",
          text.length,
          "characters"
        );
      }

      // =====================================================
      // PPTX
      // =====================================================
// =====================================================
// PPTX TEXT EXTRACTION
// =====================================================

else if (extension === ".pptx") {
  console.log("Reading PPTX file...");

  try {
    const pptxParser = new Pptx2Json();

    // Use the API supported by pptx2json
    const pptxData = await pptxParser.toJson(file.path);

    // Extract readable text from the parsed presentation
    function extractText(value) {
      if (typeof value === "string") {
        return value;
      }

      if (Array.isArray(value)) {
        return value.map(extractText).join("\n");
      }

      if (value && typeof value === "object") {
        return Object.values(value)
          .map(extractText)
          .join("\n");
      }

      return "";
    }

    text = extractText(pptxData)
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    console.log(
      "PPTX text extracted:",
      text.length,
      "characters"
    );

    if (!text) {
      throw new Error(
        "No readable text found in the PowerPoint presentation."
      );
    }
  } catch (pptxError) {
    console.error(
      "PPTX extraction error:",
      pptxError.message
    );

    throw new Error(
      `Could not extract text from PPTX: ${pptxError.message}`
    );
  }
}

      // =====================================================
      // INVALID FILE
      // =====================================================

      else {

        if (
          fs.existsSync(
            file.path
          )
        ) {
          fs.unlinkSync(
            file.path
          );
        }

        return res.status(400).json({
          success: false,
          message:
            "Unsupported file type. Only PDF, PPTX and TXT are allowed.",
        });
      }

      // =====================================================
      // CHECK EXTRACTED TEXT
      // =====================================================

      if (
        !text ||
        !text.trim()
      ) {

        if (
          fs.existsSync(
            file.path
          )
        ) {
          fs.unlinkSync(
            file.path
          );
        }

        return res.status(400).json({
          success: false,
          message:
            "No text could be extracted from the document.",
        });
      }

      // =================================================
      // CREATE DOCUMENT
      // =================================================
// CREATE DOCUMENT
savedDocument = new Document({
  name: file.originalname,
  type: extension.replace(".", "").toUpperCase(),
  uploadedBy: "Admin",
  date: new Date().toISOString(),
  fileUrl: `/uploads/${file.filename}`,
  mimeType: file.mimetype,
});

savedDocument.fileId = savedDocument._id;

await savedDocument.save();

      // =================================================
      // CREATE CHUNKS
      // =================================================

      const chunks =
        createChunks(
          text,
          1000
        );

      console.log(
        "Total chunks created:",
        chunks.length
      );

      if (chunks.length === 0) {
        throw new Error(
          "No usable text chunks were created."
        );
      }

      // =================================================
      // CREATE EMBEDDINGS
      // =================================================

      for (
        let i = 0;
        i < chunks.length;
        i++
      ) {

        console.log(
          "----------------------------------------"
        );

        console.log(
          `Creating embedding for chunk ${i + 1}/${chunks.length}`
        );

        const embedding =
          await createEmbedding(
            chunks[i]
          );

        if (
          !embedding ||
          embedding.length === 0
        ) {
          throw new Error(
            `Invalid embedding generated for chunk ${i + 1}`
          );
        }

        const chunk =
          new DocumentChunk({
            documentId:
              savedDocument._id,

            documentName:
              file.originalname,

            text:
              chunks[i],

            chunkIndex:
              i,

            embedding:
              embedding,
          });

        await chunk.save();

        console.log(
          `Saved chunk ${i + 1}/${chunks.length}`
        );

        if (
          i <
          chunks.length - 1
        ) {

          await new Promise(
            (resolve) =>
              setTimeout(
                resolve,
                500
              )
          );
        }
      }
      
     // CREATE DOCUMENT UPLOAD NOTIFICATION
try {
  let settings = await NotificationSettings.findOne();

  if (!settings) {
    settings = await NotificationSettings.create({});
  }

  if (settings.newDocumentNotification !== false) {
    await Notification.create({
      type: "document_upload",
      title: "New Document Uploaded",
      message: `${file.originalname} was uploaded successfully.`,
      read: false,
    });

    console.log("Document notification saved successfully.");
  } else {
    console.log("Document notifications are OFF.");
  }
} catch (notificationError) {
  console.error(
    "Failed to create document notification:",
    notificationError.message
  );
}

      // =================================================
      // SUCCESS
      // =================================================

      console.log(
        "========================================"
      );

      console.log(
        "DOCUMENT UPLOAD COMPLETED"
      );

      console.log(
        "========================================"
      );

      return res.status(201).json({
        success: true,

        message:
          "Document uploaded and embeddings generated successfully.",

        document:
          savedDocument.toObject(),

        totalChunks:
          chunks.length,
      });

    } catch (error) {

      console.error(
        "========================================"
      );

      console.error(
        "DOCUMENT UPLOAD ERROR"
      );

      console.error(
        error
      );

      console.error(
        "========================================"
      );

      // DELETE PARTIAL CHUNKS

      if (
        savedDocument &&
        savedDocument._id
      ) {

        try {

          await DocumentChunk.deleteMany({
            documentId:
              savedDocument._id,
          });

          console.log(
            "Partial document chunks removed."
          );

        } catch (
          cleanupError
        ) {

          console.error(
            "Chunk cleanup error:",
            cleanupError.message
          );
        }

        // DELETE DOCUMENT

        try {

          await Document.findByIdAndDelete(
            savedDocument._id
          );

          console.log(
            "Partial document removed."
          );

        } catch (
          cleanupError
        ) {

          console.error(
            "Document cleanup error:",
            cleanupError.message
          );
        }
      }

      // DELETE FILE

      if (
        uploadedFilePath &&
        fs.existsSync(
          uploadedFilePath
        )
      ) {

        try {

          fs.unlinkSync(
            uploadedFilePath
          );

          console.log(
            "Uploaded file removed after failure."
          );

        } catch (
          cleanupError
        ) {

          console.error(
            "File cleanup error:",
            cleanupError.message
          );
        }
      }

      return res.status(500).json({
        success: false,

        message:
          error.message ||
          "Document upload failed.",

        error:
          error.message ||
          "Unknown server error",
      });
    }
  }
);

// =====================================================
// GENERATE EMBEDDINGS FOR EXISTING CHUNKS
// =====================================================

app.post(
  "/api/generate-embeddings",
  async (req, res) => {

    try {

      console.log(
        "========================================"
      );

      console.log(
        "STARTING EMBEDDING GENERATION"
      );

      console.log(
        "========================================"
      );

      const chunks =
        await DocumentChunk.find({});

      console.log(
        `Total chunks found: ${chunks.length}`
      );

      let processed = 0;
      let skipped = 0;

      for (
        const chunk of chunks
      ) {

        if (
          chunk.embedding &&
          chunk.embedding.length ===
            768
        ) {

          console.log(
            `Skipping chunk ${chunk.chunkIndex} - already embedded`
          );

          processed++;
          skipped++;

          continue;
        }

        if (
          !chunk.text ||
          !chunk.text.trim()
        ) {

          console.log(
            `Skipping chunk ${chunk.chunkIndex} - empty text`
          );

          continue;
        }

        console.log(
          `Creating embedding for chunk ${chunk.chunkIndex}...`
        );

        const embedding =
          await createEmbedding(
            chunk.text
          );

        await DocumentChunk.updateOne(
          {
            _id: chunk._id,
          },

          {
            $set: {
              embedding:
                embedding,
            },
          }
        );

        processed++;

        console.log(
          `Embedded ${processed}/${chunks.length}`
        );

        await new Promise(
          (resolve) =>
            setTimeout(
              resolve,
              500
            )
        );
      }

      console.log(
        "Embedding generation completed."
      );

      res.json({
        success: true,

        message:
          "All embeddings generated successfully.",

        totalChunks:
          chunks.length,

        processed,

        skipped,
      });

    } catch (error) {

      console.error(
        "Embedding generation failed:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          error.message ||
          "Embedding generation failed.",
      });
    }
  }
);

// =====================================================
// GET DOCUMENTS
// =====================================================

app.get(
  "/api/documents",
  async (req, res) => {

    try {

      const documents =
        await Document.find()
          .sort({
            date: -1,
          });

      const documentsWithUrls =
        documents.map(
          (document) => {

            const doc =
              document.toObject();

            return doc;
          }
        );

      res.json(
        documentsWithUrls
      );

    } catch (error) {

      console.error(
        "Get documents error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch documents",
      });
    }
  }
);

// =====================================================
// DELETE DOCUMENT
// =====================================================

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
          success: false,
          message:
            "Document not found",
        });
      }

      // DELETE CHUNKS

      await DocumentChunk.deleteMany({
        documentId:
          document._id,
      });

      // DELETE PHYSICAL FILE

      if (
        document.fileUrl
      ) {

        const fileName =
          path.basename(
            document.fileUrl
          );

        const filePath =
          path.join(
            uploadFolder,
            fileName
          );

        if (
          fs.existsSync(
            filePath
          )
        ) {

          fs.unlinkSync(
            filePath
          );
        }
      }

      // DELETE DOCUMENT

      await Document.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "Document deleted successfully",
      });

    } catch (error) {

      console.error(
        "Delete document error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete document",
      });
    }
  }
);

// =====================================================
// GET USERS
// =====================================================

app.get(
  "/api/users",
  async (req, res) => {

    try {

      const users =
        await User.find()
          .select("-password");

      res.json(users);

    } catch (error) {

      console.error(
        "Get users error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch users",
      });
    }
  }
);

// =====================================================
// DELETE USER
// =====================================================

app.delete(
  "/api/users/:id",
  async (req, res) => {

    try {

      const user =
        await User.findById(
          req.params.id
        );

      if (!user) {

        return res.status(404).json({
          success: false,
          message:
            "User not found",
        });
      }

      await User.findByIdAndDelete(
        req.params.id
      );

      res.json({
        success: true,
        message:
          "User deleted successfully",
      });

    } catch (error) {

      console.error(
        "Delete user error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete user",
      });
    }
  }
);

// =====================================================
// HIGHLIGHTS - GET
// =====================================================

app.get(
  "/api/highlights",
  async (req, res) => {

    try {

      const highlights =
        await Highlight.find()
          .sort({
            _id: -1,
          });

      res.json(highlights);

    } catch (error) {

      console.error(
        "Get highlights error:",
        error
      );

      res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to fetch highlights",

        error:
          error.message ||
          "Unknown error",
      });
    }
  }
);

// =====================================================
// HIGHLIGHTS - CREATE
// =====================================================

app.post(
  "/api/highlights",
  async (req, res) => {

    try {

      console.log(
        "========================================"
      );

      console.log(
        "CREATE HIGHLIGHT"
      );

      console.log(
        "Request body:",
        req.body
      );

      console.log(
        "========================================"
      );

      const title =
        req.body.title;

      const priority =
        req.body.priority;

      // CHECK TITLE

      if (
        !title ||
        !title.trim()
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Title is required",
        });
      }

      // VALIDATE PRIORITY

      let finalPriority =
        priority || "Medium";

      if (
        typeof finalPriority ===
        "string"
      ) {

        finalPriority =
          finalPriority.trim();
      }

      if (
        ![
          "High",
          "Medium",
          "Low",
        ].includes(
          finalPriority
        )
      ) {

        finalPriority =
          "Medium";
      }

      // CREATE DATE

      const currentDate =
        new Date().toISOString();

      console.log(
        "Date being saved:",
        currentDate
      );

      // CREATE HIGHLIGHT

      const highlight =
        new Highlight({
          title:
            title.trim(),

          priority:
            finalPriority,

          date:
            currentDate,
        });

      console.log(
        "Highlight before save:",
        highlight
      );

      // SAVE TO MONGODB

      await highlight.save();

      console.log(
        "Highlight created successfully:",
        highlight
      );

      res.status(201).json({
        success: true,

        message:
          "Highlight created successfully",

        highlight:
          highlight,
      });

    } catch (error) {

      console.error(
        "========================================"
      );

      console.error(
        "CREATE HIGHLIGHT ERROR"
      );

      console.error(
        error
      );

      console.error(
        "========================================"
      );

      res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to create highlight",

        error:
          error.message ||
          "Unknown server error",
      });
    }
  }
);

 // =====================================================
// HIGHLIGHTS - DELETE
// =====================================================

app.delete("/api/highlights/:id", async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid highlight ID",
      });
    }

    const highlight = await Highlight.findByIdAndDelete(id);

    if (!highlight) {
      return res.status(404).json({
        success: false,
        message: "Highlight not found",
      });
    }

    console.log("Highlight deleted:", id);

    return res.status(200).json({
      success: true,
      message: "Highlight deleted successfully",
    });
  } catch (error) {
    console.error("Delete highlight error:", error);

    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete highlight",
    });
  }
});


// =====================================================
// SETTINGS
// =====================================================

app.get(
  "/api/settings",
  async (req, res) => {

    try {

      res.json({
        success: true,

        appName:
          "InfoHub",

        description:
          "AI-powered knowledge base and information retrieval system",

        maintenanceMode:
          false,
      });

    } catch (error) {

      console.error(
        "Settings error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch settings",
      });
    }
  }
);

// =====================================================
// GET ALL CONVERSATIONS
// =====================================================

app.get(
  "/api/conversations",
  async (req, res) => {

    try {

      const conversations =
        await Conversation.find()
          .sort({
            updatedAt: -1,
          });

      res.json(
        conversations
      );

    } catch (error) {

      console.error(
        "Get conversations error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch conversations",
      });
    }
  }
);

// =====================================================
// GET ONE CONVERSATION
// =====================================================

app.get(
  "/api/conversations/:chatId",
  async (req, res) => {

    try {

      const conversation =
        await Conversation.findOne({
          chatId:
            req.params.chatId,
        });

      if (!conversation) {

        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      res.json({
        success: true,

        conversation:
          conversation,
      });

    } catch (error) {

      console.error(
        "Get conversation error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to fetch conversation",
      });
    }
  }
);

// =====================================================
// DELETE CONVERSATION
// =====================================================

app.delete(
  "/api/conversations/:chatId",
  async (req, res) => {

    try {

      const result =
        await Conversation.deleteOne({
          chatId:
            req.params.chatId,
        });

      if (
        result.deletedCount === 0
      ) {

        return res.status(404).json({
          success: false,
          message:
            "Conversation not found",
        });
      }

      res.json({
        success: true,
        message:
          "Conversation deleted successfully",
      });

    } catch (error) {

      console.error(
        "Delete conversation error:",
        error
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to delete conversation",
      });
    }
  }
);

// =====================================================
// CHAT / RAG
// =====================================================

app.post(
  "/api/chat",
  async (req, res) => {

    try {

      const {
        question,
        chatId,
      } = req.body;

      if (
        !question ||
        !question.trim()
      ) {

        return res.status(400).json({
          success: false,
          message:
            "Question is required",
        });
      }

      const currentChatId =
        chatId ||
        Date.now().toString();
        

      console.log(
        "========================================"
      );

      console.log(
        "USER QUESTION:",
        question
      );

      console.log(
        "CHAT ID:",
        currentChatId
      );

      console.log(
        "========================================"
      );

      // QUESTION EMBEDDING

      console.log(
        "Creating question embedding..."
      );

      const questionEmbedding =
        await createEmbedding(
          question
        );

      console.log(
        "Question embedding dimensions:",
        questionEmbedding.length
      );

      // MONGODB VECTOR SEARCH

      console.log(
        "Running MongoDB vector search..."
      );

      const relevantChunks =
        await DocumentChunk.aggregate(
          [
            {
              $vectorSearch: {
                index:
                  "vector_index",

                path:
                  "embedding",

                queryVector:
                  questionEmbedding,

                numCandidates:
                  50,

                limit: 5,
              },
            },

            {
              $project: {
                _id: 1,

                documentId:
                  1,

                documentName:
                  1,

                text: 1,

                chunkIndex:
                  1,

                score: {
                  $meta:
                    "vectorSearchScore",
                },
              },
            },
          ]
        );

      console.log(
        "Relevant chunks found:",
        relevantChunks.length
      );

      relevantChunks.forEach(
        (
          chunk,
          index
        ) => {

          console.log(
            `Chunk ${index + 1}:`,
            chunk.documentName,
            "Chunk Index:",
            chunk.chunkIndex,
            "Score:",
            chunk.score
          );
        }
      );

      // NO RELEVANT INFORMATION

      if (
        relevantChunks.length === 0
      ) {

        const noAnswer =
          "I couldn't find that information in the uploaded documents.";

        await saveConversation(
          currentChatId,
          question,
          noAnswer,
          ""
        );

        return res.json({
          success: true,

          answer:
            noAnswer,

          source: "",

          chatId:
            currentChatId,
        });
      }

      // BUILD DOCUMENT CONTEXT

      let context = "";

      relevantChunks.forEach(
        (
          chunk,
          index
        ) => {

          context += `
SOURCE ${index + 1}: ${
            chunk.documentName ||
            "Unknown document"
          }

CONTENT:
${chunk.text}

--------------------------------
`;
        }
      );

      // GEMINI PROMPT

      const prompt = `
You are InfoHub, an AI knowledge-base assistant.

Answer the user's question ONLY using the information
provided in the DOCUMENT CONTEXT below.

Do not use outside knowledge.

If the answer is not available in the document context,
say:

"I couldn't find that information in the uploaded documents."

Do not invent or assume information.

Keep the answer clear and easy to understand.

If the uploaded document contains dates, schedules,
calendars, events, names, numbers or other specific
information, use that information accurately.

DOCUMENT CONTEXT:

${context}

USER QUESTION:

${question}

ANSWER:
`;

      // GENERATE ANSWER

      console.log(
        "Generating Gemini answer..."
      );

      const answer =
        await generateGeminiAnswer(
          prompt
        );

      // SOURCES

      const sources = [
        ...new Set(
          relevantChunks.map(
            (chunk) =>
              chunk.documentName
          )
        ),
      ];

      const sourceText =
        sources.join(", ");

      console.log(
        "AI ANSWER:",
        answer
      );

      console.log(
        "SOURCE:",
        sourceText
      );

      // SAVE CONVERSATION

      await saveConversation(
        currentChatId,
        question,
        answer,
        sourceText
      );

      // RESPONSE

      res.json({
        success: true,

        answer:
          answer,

        source:
          sourceText,

        chatId:
          currentChatId,
      });

    } catch (error) {

      console.error(
        "========================================"
      );

      console.error(
        "CHAT ERROR"
      );

      console.error(
        error
      );

      console.error(
        "========================================"
      );

      res.status(500).json({
        success: false,

        message:
          error.message ||
          "Failed to generate answer",
      });
    }
  }
);

app.post("/api/notifications/system-update", async (req, res) => {
  try {
    const settings = await getNotificationSettings();

    if (settings.systemNotification === false) {
      return res.json({
        success: true,
        created: false,
        message: "System update notifications are OFF.",
      });
    }

    const notification = await Notification.create({
      type: "system_update",
      title: req.body.title || "InfoHub System Update",
      message: req.body.message || "InfoHub has received a system update.",
      read: false,
    });

    return res.status(201).json({
      success: true,
      created: true,
      notification,
    });
  } catch (error) {
    console.error("System update notification error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to create system update notification.",
    });
  }
});


/* GET ALL NOTIFICATIONS */

app.get("/api/notifications", async (req, res) => {
  try {
    const settings = await getNotificationSettings();

    const allNotifications = await Notification.find()
      .sort({ createdAt: -1 });

    const notifications = allNotifications.filter((notification) => {
      if (
        notification.type === "document_upload" &&
        settings.newDocumentNotification === false
      ) {
        return false;
      }

      if (
        notification.type === "user_registration" &&
        settings.userNotification === false
      ) {
        return false;
      }

      if (
        notification.type === "system_update" &&
        settings.systemNotification === false
      ) {
        return false;
      }

      return true;
    });

    const unreadCount = notifications.filter(
      (notification) => !notification.read
    ).length;

    return res.json({
      success: true,
      notifications,
      unreadCount,
    });
  } catch (error) {
    console.error("Get notifications error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch notifications.",
    });
  }
});


// =====================================================
// MULTER ERROR HANDLER
// =====================================================

app.use(
  (
    error,
    req,
    res,
    next
  ) => {

    console.error(
      "Global server error:",
      error
    );

    if (
      error instanceof multer.MulterError
    ) {

      return res.status(400).json({
        success: false,

        message:
          `Upload error: ${error.message}`,
      });
    }

    if (
      error.message &&
      error.message.includes(
        "Unsupported file type"
      )
    ) {

      return res.status(400).json({
        success: false,

        message:
          error.message,
      });
    }

    res.status(500).json({
      success: false,

      message:
        error.message ||
        "Internal server error",
    });
  }
);
// GET notification settings
app.get("/api/notification-settings", async (req, res) => {
  try {
    let settings = await NotificationSettings.findOne();

    if (!settings) {
      settings = await NotificationSettings.create({});
    }

    res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error fetching notification settings:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch notification settings",
    });
  }
});


app.put("/api/notification-settings", async (req, res) => {
  try {
    const {
      newDocumentNotification,
      userNotification,
      systemNotification,
    } = req.body;

    const updateFields = {};

    if (typeof newDocumentNotification === "boolean") {
      updateFields.newDocumentNotification = newDocumentNotification;
    }

    if (typeof userNotification === "boolean") {
      updateFields.userNotification = userNotification;
    }

    if (typeof systemNotification === "boolean") {
      updateFields.systemNotification = systemNotification;
    }

    let settings = await NotificationSettings.findOne();

    if (!settings) {
      settings = await NotificationSettings.create({});
    }

    Object.assign(settings, updateFields);
    await settings.save();

    return res.json({
      success: true,
      settings,
    });
  } catch (error) {
    console.error("Error updating notification settings:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update notification settings",
    });
  }
});
// Forgot Password API
app.put("/api/forgot-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    if (!email || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email and new password are required.",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long.",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Find the registered user
    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No account found with this email address.",
      });
    }

    // Update the password
    user.password = newPassword;
    await user.save();

    return res.json({
      success: true,
      message: "Password updated successfully! Redirecting to sign in...",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to reset password. Please try again.",
    });
  }
});

// =====================================================
// 404 HANDLER
// =====================================================

app.use(
  (req, res) => {

    res.status(404).json({
      success: false,

      message:
        `API route not found: ${req.method} ${req.originalUrl}`,
    });
  }
);

// =====================================================
// START SERVER
// =====================================================

app.listen(
  PORT,
  () => {

    console.log(
      "========================================"
    );

    console.log(
      `InfoHub backend running on http://localhost:${PORT}`
    );

    console.log(
      `Uploaded files available at http://localhost:${PORT}/uploads/`
    );

    console.log(
      "========================================"
    );
  }
);
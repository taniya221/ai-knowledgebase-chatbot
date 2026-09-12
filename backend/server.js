const dns = require('dns');
dns.setServers(['8.8.8.8', '1.1.1.1']);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Document = require('./models/Document');

const app = express();
app.use(cors());
app.use(express.json());

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Make the uploads folder publicly accessible
app.use('/uploads', express.static(uploadDir));

// Connect to MongoDB Atlas
mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://document_user:doc123@cluster0.sizckvu.mongodb.net/knoai?appName=Cluster0')
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch(err => console.error('MongoDB connection error:', err));

// Configure Multer for local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// GET: Fetch all documents
app.get('/api/documents', async (req, res) => {
  try {
    const docs = await Document.find().sort({ _id: -1 });
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST: Upload a file, save info to MongoDB, and return updated list
app.post('/api/documents', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const currentDate = new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const fileExtension = req.file.originalname.split(".").pop().toUpperCase();

    const newDoc = new Document({
      name: req.file.originalname,
      type: fileExtension || 'FILE',
      uploadedBy: 'Admin',
      date: currentDate,
      fileUrl: `http://localhost:5000/uploads/${req.file.filename}`,
      fileId: new mongoose.Types.ObjectId(),
      mimeType: req.file.mimetype
    });

    await newDoc.save();
    const allDocs = await Document.find().sort({ _id: -1 });
    res.json(allDocs);
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DELETE: Remove a document from MongoDB by ID
app.delete('/api/documents/:id', async (req, res) => {
  try {
    const document = await Document.findByIdAndDelete(req.params.id);
    if (document && document.fileUrl) {
      // Optional: Clean up local file from disk
      const filename = document.fileUrl.split('/uploads/')[1];
      const filePath = path.join(__dirname, 'uploads', filename);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }
    const allDocs = await Document.find().sort({ _id: -1 });
    res.json(allDocs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
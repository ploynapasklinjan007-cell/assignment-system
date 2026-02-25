require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const ensureDir = dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

ensureDir('uploads/assignments');
ensureDir('uploads/submissions');
ensureDir('uploads/avatars');

app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

// ✅ ใช้ ROUTE อย่างเดียว
app.use('/api/auth', require('./routes/auth.route'));
app.use('/api/pdf', require('./routes/pdf.route'));
app.use('/api/upload', require('./routes/upload.route'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ message: err.message });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

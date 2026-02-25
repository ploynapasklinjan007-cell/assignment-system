const express = require('express');
const multer = require('multer');
const path = require('path');

const router = express.Router();

/* ===== Storage ===== */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (req.path.includes('assignment')) {
      cb(null, 'uploads/assignments');
    } else {
      cb(null, 'uploads/submissions');
    }
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

/* ===== Upload assignment files ===== */
router.post('/assignment-files', upload.array('files'), (req, res) => {
  const files = req.files.map(f => ({
    name: f.originalname,
    path: '/' + f.path.replace(/\\/g, '/')
  }));

  res.json({ files });
});

/* ===== Upload submission files ===== */
router.post('/submission-files', upload.array('files'), (req, res) => {
  const files = req.files.map(f => ({
    name: f.originalname,
    path: '/' + f.path.replace(/\\/g, '/')
  }));

  res.json({ files });
});

module.exports = router;

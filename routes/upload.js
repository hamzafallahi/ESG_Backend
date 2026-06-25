const express = require('express');
const { upload, uploadFile } = require('../controllers/UploadController');

const router = express.Router();

// POST /upload  — accepts a single "file" field, returns Cloudinary metadata
router.post('/', upload.single('file'), uploadFile);

module.exports = router;

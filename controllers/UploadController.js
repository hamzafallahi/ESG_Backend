const multer = require('multer');
const { uploadBuffer } = require('../services/cloudinaryService');

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

const storage = multer.memoryStorage();

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10 MB
    files: 1,
  },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}`), false);
    }
  },
});

const uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ errors: [{ detail: 'No file provided' }] });
    }

    // Sanitize filename for Cloudinary public_id
    const safeName = req.file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_');
    const publicId = `${Date.now()}-${safeName}`;

    const result = await uploadBuffer(req.file.buffer, { public_id: publicId });

    return res.status(200).json({
      url: result.secure_url,
      public_id: result.public_id,
      original_name: req.file.originalname,
      size: req.file.size,
      mime_type: req.file.mimetype,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { upload, uploadFile };

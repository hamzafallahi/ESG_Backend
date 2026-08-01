const cloudinary = require('cloudinary').v2;
const { Readable } = require('stream');

cloudinary.config({
  cloud_name: 'dexfsqv43',
  api_key: '964643311311476',
  api_secret: 'kxM7WDCSkyZMHA6YJ6dr4-FM8X0',
});

/**
 * Upload a file buffer to Cloudinary.
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {object} options - Cloudinary upload options (folder, public_id, etc.)
 * @returns {Promise<object>} Cloudinary upload result
 */
const uploadBuffer = (buffer, options = {}) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: 'esg-justifications',
        resource_type: 'auto',
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    const readable = new Readable();
    readable.push(buffer);
    readable.push(null);
    readable.pipe(uploadStream);
  });
};

/**
 * Delete a file from Cloudinary by its public_id.
 * @param {string} publicId - Cloudinary public_id
 */
const deleteFile = (publicId) =>
  cloudinary.uploader.destroy(publicId, { resource_type: 'raw' }).catch((err) => {
    console.error('[Cloudinary] Failed to delete file:', publicId, err);
  });

module.exports = { uploadBuffer, deleteFile };

// src/utils/cloudinary.js
const cloudinary = require('cloudinary').v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadImage(buffer, folder = 'ngos/teachers') {
  // buffer -> pass path or buffer? multer will write temp file path, we will upload by path
  return cloudinary.uploader.upload(buffer, {
    folder,
    resource_type: 'image',
    overwrite: true,
    use_filename: true,
  });
}

module.exports = { cloudinary, uploadImage };

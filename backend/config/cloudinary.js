const cloudinary = require('cloudinary').v2;
const env = require('./environment');

const isConfigured = Boolean(
  env.CLOUDINARY_CLOUD_NAME && env.CLOUDINARY_API_KEY && env.CLOUDINARY_API_SECRET
);

if (isConfigured) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
  });
} else if (env.NODE_ENV === 'production') {
  console.error('Cloudinary credentials are not set. Image uploads will fail in production.');
} else {
  console.warn('Cloudinary not configured. Image uploads will not work.');
}

module.exports = { cloudinary, isCloudinaryConfigured: isConfigured };

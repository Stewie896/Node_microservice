const cloudinary = require('cloudinary').v2;

module.exports = cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY
    api_secret: process.env.SEC_RET,
    secure: true
})

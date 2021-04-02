const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Pages',
        allowedFormats: ['jpeg', 'png', 'jpg', 'heic'],
        transformation: [
            { width: 600, gravity: "auto", crop: "fill" },
        ], 
        format: 'jpg'
    }
});

const storage2 = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Categories',
        allowedFormats: ['jpeg', 'png', 'jpg', 'heic'],
        transformation: [
            { width: 175, height: 175, gravity: "auto", crop: "fill" },
        ], 
        format: 'jpg'
    }
});

const storage3 = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'Products',
        allowedFormats: ['jpeg', 'png', 'jpg', 'heic'],
        transformation: [
            { width: 225, height: 325, gravity: "auto", crop: "fill" },
        ], 
        format: 'jpg'
    }
});

module.exports = {
    cloudinary,
    storage,
    storage2,
    storage3
}
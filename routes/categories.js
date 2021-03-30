const express = require('express');
const router = express.Router();
const categories = require('../controllers/categories');
const products = require('../controllers/products');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCategory } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Category = require('../models/category');
const Product = require('../models/product');

router.route('/')
    .get(catchAsync(categories.index))
    .post(isLoggedIn, upload.array('image'), validateCategory, catchAsync(categories.createCategory))

router.get('/new', isLoggedIn, categories.renderNewForm)

router.route('/:slug')
    .get(catchAsync(categories.showCategory))
    
router.route('/:id')
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCategory, catchAsync(categories.updateCategory))
    .delete(isLoggedIn, isAuthor, catchAsync(categories.deleteCategory));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(categories.renderEditForm))



module.exports = router;
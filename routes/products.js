const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateProduct, isLoggedIn, isProductAuthor } = require('../middleware');
const Product = require('../models/product');
const Category = require('../models/category');
const products = require('../controllers/products');
const categories = require('../controllers/categories');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(products.index))
    .post(isLoggedIn, upload.array('photo'), validateProduct, catchAsync(products.createProduct))

// router.get("/search", (catchAsync(products.index)) )

// router.get('/new', isLoggedIn, products.renderNewForm)

router.route('/:slug/show')
    .get(catchAsync(products.showProduct))

router.route('/:productId')
    .put(isLoggedIn, isProductAuthor, upload.array('photo'), validateProduct, catchAsync(products.updateProduct))
    .delete(isLoggedIn, isProductAuthor, catchAsync(products.deleteProduct));

router.get('/:productId/edit', isLoggedIn, isProductAuthor, catchAsync(products.renderEditForm))



module.exports = router;
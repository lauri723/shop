const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const pages = require('../controllers/pages');
const { isLoggedIn, isPageAuthor, validatePage } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Page = require('../models/page');


router.route('/')
    .get(catchAsync(pages.index))
    .post(isLoggedIn, upload.array('image'), validatePage, catchAsync(pages.createPage))


router.get('/new', isLoggedIn, pages.renderNewForm)

router.route('/:slug')
    .get(catchAsync(pages.showPage))
    
router.route('/:id')
    .put(isLoggedIn, isPageAuthor, upload.array('image'), validatePage, catchAsync(pages.updatePage))
    .delete(isLoggedIn, isPageAuthor, catchAsync(pages.deletePage));

router.get('/:id/edit', isLoggedIn, isPageAuthor, catchAsync(pages.renderEditForm))



module.exports = router;
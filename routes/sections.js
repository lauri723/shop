const express = require('express');
const router = express.Router();
const sections = require('../controllers/sections');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateSection } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Section = require('../models/section');

router.route('/')
    .get(catchAsync(sections.index))
    .post(isLoggedIn, upload.array('image'), validateSection, catchAsync(sections.createSection))


router.get('/new', isLoggedIn, sections.renderNewForm)

router.route('/:slug')
    .get(catchAsync(sections.showSection))
    
router.route('/:id')
    .put(isLoggedIn, isAuthor, upload.array('image'), validateSection, catchAsync(sections.updateSection))
    .delete(isLoggedIn, isAuthor, catchAsync(sections.deleteSection));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(sections.renderEditForm))



module.exports = router;
const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateListing, isLoggedIn, isListingAuthor } = require('../middleware');
const Listing = require('../models/listing');
const Section = require('../models/section');
const listings = require('../controllers/listings');
const sections = require('../controllers/sections');
const ExpressError = require('../utils/ExpressError');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.route('/')
    .get(catchAsync(listings.index))
    .post(isLoggedIn, upload.array('photo'), validateListing, catchAsync(listings.createListing))

// router.get('/new', isLoggedIn, listings.renderNewForm)

router.route('/:slug/show')
    .get(catchAsync(listings.showListing))

router.route('/:listingId')
    .put(isLoggedIn, isListingAuthor, upload.array('photo'), validateListing, catchAsync(listings.updateListing))
    .delete(isLoggedIn, isListingAuthor, catchAsync(listings.deleteListing));

router.get('/:listingId/edit', isLoggedIn, isListingAuthor, catchAsync(listings.renderEditForm))



module.exports = router;
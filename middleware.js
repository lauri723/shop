const { sectionSchema, listingSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Section = require('./models/section');
const Listing = require('./models/listing');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateSection = (req, res, next) => {
    const { error } = sectionSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isAuthor = async (req, res, next) => {
    const { id } = req.params;
    const section = await Section.findById(id);
    if (!section.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/sections/${id}`);
    }
    next();
}

module.exports.isListingAuthor = async (req, res, next) => {
    const { id, listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/sections/${id}`);
    }
    next();
}

module.exports.validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}


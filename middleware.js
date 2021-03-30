const { categorySchema, productSchema, pageSchema } = require('./schemas.js');
const ExpressError = require('./utils/ExpressError');
const Page = require('./models/page');
const Category = require('./models/category');
const Product = require('./models/product');

module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        req.flash('error', 'You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.validateCategory = (req, res, next) => {
    const { error } = categorySchema.validate(req.body);
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
    const category = await Category.findById(id);
    if (!category.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/categories/${id}`);
    }
    next();
}

module.exports.validateProduct = (req, res, next) => {
    const { error } = productSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isProductAuthor = async (req, res, next) => {
    const { id, productId } = req.params;
    const product = await Product.findById(productId);
    if (!product.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/categories/${id}`);
    }
    next();
}

module.exports.validatePage = (req, res, next) => {
    const { error } = pageSchema.validate(req.body);
    console.log(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',')
        throw new ExpressError(msg, 400)
    } else {
        next();
    }
}

module.exports.isPageAuthor = async (req, res, next) => {
    const { id } = req.params;
    const page = await Page.findById(id);
    if (!page.author.equals(req.user._id)) {
        req.flash('error', 'You do not have permission to do that!');
        return res.redirect(`/pages/${id}`);
    }
    next();
}


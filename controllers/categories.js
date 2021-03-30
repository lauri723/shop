const Category = require('../models/category');
const Product = require('../models/product');
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const categories = await Category.find({}).sort({ orderKey: 1 }).sort({ createdAt: 'desc' })
    res.render('categories/index', {
        categories,
        searchOptions: req.query,
        title: "Categories"
    })
}

module.exports.renderNewForm = (req, res) => {
    res.render('categories/new', { title: "Admin" });
}

module.exports.createCategory = async (req, res, next) => {
    const category = new Category(req.body.category);
    category.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    category.author = req.user._id;
    await category.save();
    console.log(category);
    req.flash('success', 'Successfully made a new category!');
    res.redirect(`/categories/${category.slug}`)
    // res.redirect(`/categories/${category._id}`)
}

module.exports.showCategory = async (req, res,) => {
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    const categories = await Category.find({})
    const category = await Category.findOne({ slug: req.params.slug }).populate({
        path: 'products',
        options: {
            sort: { orderKey: 1 },
            sort: { createdAt: 'desc' },
            skip: (perPage * page - perPage),
            limit: perPage,
            populate: "category"
        },
        populate: {
            path: 'author'
        }
    }).populate('author');

    const products = await Product.find()
    const product = await Product.findOne({ slug: req.params.slug })

    const count = await Product.countDocuments();

    if (!category) {
        req.flash('error', 'Cannot find that category!');
        return res.redirect('/categories');
    }
    res.render('categories/show', {
        category,
        categories,
        products,
        product,
        searchOptions: req.query,
        current: page,
        home: "/categories/" + req.params.slug.toString() + "/?",
        pages: Math.ceil(count / perPage),
        title: "Category"
    });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const category = await Category.findById(id)
    if (!category) {
        req.flash('error', 'Cannot find that category!');
        return res.redirect('/categories');
    }
    res.render('categories/edit', {
        category,
        searchOptions: req.query,
        title: "Admin"
    });
}

module.exports.updateCategory = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const category = await Category.findByIdAndUpdate(id, { ...req.body.category });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    category.images.push(...imgs);
    await category.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await category.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated category!');
    res.redirect(`/categories/${category.slug}`)
}

module.exports.deleteCategory = async (req, res) => {
    const { id } = req.params;
    await Category.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted category')
    res.redirect('/categories');
}
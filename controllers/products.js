const Category = require('../models/category');
const Product = require('../models/product');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const perPage = 8;
    let page = parseInt(req.query.page) || 1;
    let query = Product.find()
        .sort({ orderKey: 1 })
        .sort({ createdAt: 'desc' })
        .skip(perPage * page - perPage)
        .limit(perPage)
        .populate("category");
    if (req.query.title != null && req.query.title != '') {
        query = query.regex('title', new RegExp(req.query.title, 'i'))
    }

    const count = await Product.countDocuments();

    const products = await query.exec()
    const categories = await Category.find()
        .sort({ orderKey: 1 })
        .sort({ createdAt: 'desc' })
    res.render('products/index', {
        products,
        searchOptions: req.query,
        categories,
        current: page,
        home: "/products/?",
        pages: Math.ceil(count / perPage), 
        title: "Products"
    })
}

module.exports.createProduct = async (req, res) => {
    const category = await Category.findById(req.params.id);
    const product = new Product(req.body.product);
    product.photos = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.author = req.user._id;
    category.products.push(product);
    await product.save();
    await category.save();
    console.log(product)
    req.flash('success', 'Created new product!');
    res.redirect(`/categories/${category.slug}`);
}

module.exports.showProduct = async (req, res,) => {
    // const { productId } = req.params;
    const product = await Product.findOne({ slug: req.params.slug })
    const categories = await Category.find({})
    const category = await Category.findOne({ slug: req.params.slug })
    // const product = await Product.findById(req.params.productId)
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products');
    }
    res.render('products/show', { 
        category_id: req.params.id, 
        product,
        category,
        categories,
        searchOptions: req.query, 
        title: "Product" 
    });
}

module.exports.renderEditForm = async (req, res) => {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    if (!product) {
        req.flash('error', 'Cannot find that product!');
        return res.redirect('/products');
    }
    res.render('products/edit', { 
        category_id: req.params.id, 
        product: product,
        searchOptions: req.query, 
        title: "Admin" });
}

module.exports.updateProduct = async (req, res) => {
    const { id, productId } = req.params;
    const product = await Product.findByIdAndUpdate(productId, { ...req.body.product });
    const photos = req.files.map(f => ({ url: f.path, filename: f.filename }));
    product.photos.push(...photos);
    await product.save();
    if (req.body.deletePhotos) {
        for (let filename of req.body.deletePhotos) {
            await cloudinary.uploader.destroy(filename);
        }
        await product.updateOne({ $pull: { photos: { filename: { $in: req.body.deletePhotos } } } })
    }
    console.log(req.body);
    req.flash('success', 'Successfully updated product!');
    res.redirect(`/products`);
}

module.exports.deleteProduct = async (req, res) => {
    const { id, productId } = req.params;
    await Category.findByIdAndUpdate(id, { $pull: { products: productId } });
    await Product.findByIdAndDelete(productId);
    req.flash('success', 'Successfully deleted product')
    res.redirect(`/products`);
}


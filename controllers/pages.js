const Page = require('../models/page');
const { cloudinary } = require("../cloudinary");

module.exports.index = async (req, res) => {
    const pages = await Page.find({}).sort({ orderKey: 1 })
    res.render('pages/index', { 
        pages,
        searchOptions: req.query, 
        title: "Admin"})
}

module.exports.renderNewForm = (req, res) => {
    res.render('pages/new', {title: "Admin"});
}

module.exports.createPage = async (req, res, next) => {
    const page = new Page(req.body.page);
    page.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    page.author = req.user._id;
    await page.save();
    console.log(page);
    req.flash('success', 'Successfully made a new page!');
    res.redirect(`/pages/${page.slug}`)
}

module.exports.showPage = async (req, res,) => {
    // const pages = await Page.find({})
    const page = await Page.findOne({ slug: req.params.slug }).populate('author');
    if (!page) {
        req.flash('error', 'Cannot find thatpage!');
        return res.redirect('/pages');
    }
    res.render('pages/show', { 
        page,
        searchOptions: req.query, 
        title: "Page" });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const page = await Page.findById(id);
    if (!page) {
        req.flash('error', 'Cannot find that page!');
        return res.redirect('/pages');
    }
    res.render('pages/edit', { 
        page,
        searchOptions: req.query, 
        title: "Admin" });
}

module.exports.updatePage = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const page = await Page.findByIdAndUpdate(id, { ...req.body.page });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    page.images.push(...imgs);
    await page.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await page.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated page!');
    res.redirect(`/pages/${page.slug}`)
}

module.exports.deletePage = async (req, res) => {
    const { id } = req.params;
    await Page.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted page')
    res.redirect('/pages');
}
 

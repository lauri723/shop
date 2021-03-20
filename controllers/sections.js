const Section = require('../models/section');
const { cloudinary } = require("../cloudinary");


module.exports.index = async (req, res) => {
    const sections = await Section.find({}).sort({ orderKey: 1 }).sort({ createdAt: 'desc'})
    res.render('sections/index', { sections, title: "Sections"})
}

module.exports.renderNewForm = (req, res) => {
    res.render('sections/new', {title: "Admin"});
}

module.exports.createSection = async (req, res, next) => {
    const section = new Section(req.body.section);
    section.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    section.author = req.user._id;
    await section.save();
    console.log(section);
    req.flash('success', 'Successfully made a new section!');
    res.redirect(`/sections/${section.slug}`)
    // res.redirect(`/sections/${section._id}`)
}

module.exports.showSection = async (req, res,) => {
    const sections = await Section.find({})
    const section = await Section.findOne({ slug: req.params.slug }).populate({
        path: 'listings',
        populate: {
            path: 'author'
        }
    }).populate('author');
    if (!section) {
        req.flash('error', 'Cannot find that section!');
        return res.redirect('/sections');
    }
    res.render('sections/show', { section, sections, title: "Section" });
}

module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const section = await Section.findById(id)
    if (!section) {
        req.flash('error', 'Cannot find that section!');
        return res.redirect('/sections');
    }
    res.render('sections/edit', { section, title: "Admin" });
}

module.exports.updateSection = async (req, res) => {
    const { id } = req.params;
    console.log(req.body);
    const section = await Section.findByIdAndUpdate(id, { ...req.body.section });
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    section.images.push(...imgs);
    await section.save();
    if (req.body.deleteImages) {
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        await section.updateOne({ $pull: { images: { filename: { $in: req.body.deleteImages } } } })
    }
    req.flash('success', 'Successfully updated section!');
    res.redirect(`/sections/${section._id}`)
}

module.exports.deleteSection = async (req, res) => {
    const { id } = req.params;
    await Section.findByIdAndDelete(id);
    req.flash('success', 'Successfully deleted section')
    res.redirect('/sections');
}
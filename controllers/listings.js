const Section = require('../models/section');
const Listing = require('../models/listing');
const { cloudinary } = require("../cloudinary");

module.exports.createListing = async (req, res) => {
    const section = await Section.findById(req.params.id);
    const listing = new Listing(req.body.listing);
    listing.photos = req.files.map(f => ({ url: f.path, filename: f.filename }));
    listing.author = req.user._id;
    section.listings.push(listing);
    await listing.save();
    await section.save();
    console.log(listing)
    req.flash('success', 'Created new listing!');
    res.redirect(`/sections/${section.slug}`);
}

module.exports.showListing = async (req, res,) => {
    // const { listingId } = req.params;
    const listing = await Listing.findOne({ slug: req.params.slug} )
    // const listing = await Listing.findById(req.params.listingId)
    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/sections');
    }
    res.render('listings/show', { section_id: req.params.id, listing: listing, title: "Listing" });
}

module.exports.renderEditForm = async (req, res) => {
    const { listingId } = req.params;
    const listing = await Listing.findById(listingId);
    if (!listing) {
        req.flash('error', 'Cannot find that listing!');
        return res.redirect('/sections');
    }
    res.render('listings/edit', { section_id: req.params.id, listing: listing, title: "Admin" });
}
 
module.exports.updateListing = async (req, res) => {
    const { id, listingId } = req.params;
    const listing = await Listing.findByIdAndUpdate(listingId, {...req.body.listing});
    const photos = req.files.map(f => ({ url: f.path, filename: f.filename }));
    listing.photos.push(...photos);
    await listing.save();
    if (req.body.deletePhotos) {
        for (let filename of req.body.deletePhotos) {
            await cloudinary.uploader.destroy(filename);
        }
        await listing.updateOne({ $pull: { photos: { filename: { $in: req.body.deletePhotos } } } })
    }
    console.log(req.body);
    req.flash('success', 'Successfully updated listing!');
    res.redirect(`/sections/${id}`);
}

module.exports.deleteListing = async (req, res) => {
    const { id, listingId } = req.params;
    await Section.findByIdAndUpdate(id, { $pull: { listings: listingId } });
    await Listing.findByIdAndDelete(listingId);
    req.flash('success', 'Successfully deleted listing')
    res.redirect(`/sections/${id}`);
}


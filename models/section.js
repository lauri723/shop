const mongoose = require('mongoose');
const slugify = require('slugify')
const Listing = require('./listing')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const SectionSchema = new Schema({
    title: String,
    images: [ImageSchema],
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
      },
    notification: String,
    orderKey: Number,
    slug: {
        type: String,
        required: true,
        unique: true
      },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    listings: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Listing'
        }
    ]
}, opts);


SectionSchema.pre('validate', function(next) {
    if (this.title) {
      this.slug = slugify(this.title + "-" + Math.floor(1000 + Math.random() * 9000), { lower: true, strict: true })
    }
    
    next()
  })

SectionSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Listing.deleteMany({
            _id: {
                $in: doc.listings
            }
        })
    }
})

module.exports = mongoose.model('Section', SectionSchema);
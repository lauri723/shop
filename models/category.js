const mongoose = require('mongoose');
const slugify = require('slugify')
const Product = require('./product')
const Schema = mongoose.Schema;


const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function () {
    return this.url.replace('/upload', '/upload/w_200');
});

const opts = { toJSON: { virtuals: true } };

const CategorySchema = new Schema({
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
    products: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Product'
        }
    ]
}, opts);


CategorySchema.pre('validate', function(next) {
    if (this.title) {
      this.slug = slugify(this.title + "-" + Math.floor(1000 + Math.random() * 9000), { lower: true, strict: true })
    }
    
    next()
  })

CategorySchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Product.deleteMany({
            _id: {
                $in: doc.products
            }
        })
    }
})

module.exports = mongoose.model('Category', CategorySchema);
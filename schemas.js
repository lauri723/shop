const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

const Joi = BaseJoi.extend(extension)

module.exports.sectionSchema = Joi.object({
    section: Joi.object({
        title: Joi.string().required().escapeHTML(),
        notification: Joi.string().required().escapeHTML(),
        orderKey: Joi.number().required().min(0),
    }).required(),
    deleteImages: Joi.array()
});

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().required().escapeHTML(),
        description: Joi.string().required().escapeHTML(),
        materials: Joi.string().required().escapeHTML(),
        tags: Joi.string().required().escapeHTML(),
        notation: Joi.string().required().escapeHTML(),
        orderKey: Joi.number().required().min(0),
        price: Joi.number().required().min(0),
    }).required(),
    deletePhotos: Joi.array()
})


const express = require('express');
const router = express.Router();
// const listings = require('../controllers/listings');
// const catchAsync = require('../utils/catchAsync');
// const { isLoggedIn, isAuthor, validateSection } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Listing = require('../models/listing');

router.get('/checkout', function (req, res, next) {
    const listings = req.session.cart;
    res.render('checkout', {
        listings: listings,
        // title: "Shopping Cart"
    });
});


router.get('/add/:listing', function (req, res) {
    const slug = req.params.listing
    Listing.findOne({ slug: slug }, function (err, listing) {
        if (err) return console.log(err);
        if (req.session.cart === undefined) {
            req.session.cart = [];
            req.session.cart.push({
                id: listing._id,
                title: listing.title,
                qty: 1,
                price: listing.price,
            });    
        } else {
            let item = req.session.cart.find(item => {
                return item.id == listing._id;
            });

            if (item) {
                item.qty++;
            } else {
                req.session.cart.push({
                    id: listing._id,
                    title: listing.title,
                    qty: 1,
                    price: listing.price,
                });
            }
        }
        res.redirect('/cart/checkout')
        // res.redirect('/cart/checkout', {
        //     title: "Shopping Cart"
        // });
    });
});

router.get('/update/:listing', function (req, res, next) {
    let action = req.query.action;
    let listing = req.session.cart.find(item => {
        return item.id == req.params.listing;
    });
    let index = req.session.cart.indexOf(listing);
    switch (action) {
        case 'add':
            listing.qty++;
            break;
        case 'min':
            listing.qty--;
            if (listing.qty < 1) {
                req.session.cart.splice(index, 1)
            }
            break;
        case "clear":
            req.session.cart.splice(index, 1);
            if (listing.qty <= 0)
                delete req.session.cart;
            break;
        // case 'clear':
        //     req.session.destroy();
        //     res.redirect('/cart/checkout');
        //     break;
        default:
            res.redirect('/cart/checkout');
            break;
    }
    res.redirect('/cart/checkout')
    // res.redirect('/cart/checkout', {
    //     title: "Shopping Cart"
    // });
});

router.get('/cancel', function(req, res, next) {
    res.redirect('/sections');
});


router.get('/shop', function (req, res, next) {
    res.redirect('/sections');
});


module.exports = router;
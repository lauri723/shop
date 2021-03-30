const express = require('express');
const router = express.Router();
const products = require('../controllers/products');
const catchAsync = require('../utils/catchAsync');
const { isLoggedIn, isAuthor, validateCategory } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Product = require('../models/product');

router.get('/checkout', function (req, res, next) {
    const products = req.session.cart;
    res.render('checkout', {
        products: products,
        cart: req.session.cart
        // title: "Shopping Cart"
    });
});


router.get('/add/:product', function (req, res) {
    const slug = req.params.product
    Product.findOne({ slug: slug }, function (err, product) {
        if (err) return console.log(err);
        if (req.session.cart === undefined) {
            req.session.cart = [];
            req.session.cart.push({
                id: product._id,
                title: product.title,
                qty: 1,
                price: product.price,
                photos: product.photos(req.files.map(f => ({ url: f.path, filename: f.filename })))
            });    
        } else {
            let item = req.session.cart.find(item => {
                return item.id == product._id;
            });

            if (item) {
                item.qty++;
            } else {
                req.session.cart.push({
                    id: product._id,
                    title: product.title,
                    qty: 1,
                    price: product.price,
                    photos: product.photos(req.files.map(f => ({ url: f.path, filename: f.filename })))
                });
            }
        }
        res.redirect('/cart/checkout')
        // res.redirect('/cart/checkout', {
        //     title: "Shopping Cart"
        // });
    });
});

router.get('/update/:product', function (req, res, next) {
    let action = req.query.action;
    let product = req.session.cart.find(item => {
        return item.id == req.params.product;
    });
    let index = req.session.cart.indexOf(product);
    switch (action) {
        case 'add':
            product.qty++;
            break;
        case 'min':
            product.qty--;
            if (product.qty < 1) {
                req.session.cart.splice(index, 1)
            }
            break;
        case "clear":
            req.session.cart.splice(index, 1);
            if (product.qty <= 0)
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
    res.redirect('/categories');
});


router.get('/shop', function (req, res, next) {
    res.redirect('/categories');
});


module.exports = router;
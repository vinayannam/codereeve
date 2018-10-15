var express = require('express');
var router = express.Router();
var User = require('../models/user.js')
router.get('/', ensureAuthenticated, function(req, res) {
    if (req.user.user == 'admin') {
        res.redirect('/admin');
    } else if (req.user.user == 'faculty') {
        res.redirect('/faculty');
    } else {
        res.redirect('/student');
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

module.exports = router;
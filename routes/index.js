var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res) {
    if (req.user.type == 'admin') {
        res.redirect('/admin');
    } else if (req.user.type == 'faculty') {
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
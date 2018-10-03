var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res) {
    res.render('faculty', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        faculty: true,
        add: true
    });
});

router.get('/previous', ensureAuthenticated, function(req, res) {
    res.render('faculty', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        faculty: true,
        previous: true
    });
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}


module.exports = router;
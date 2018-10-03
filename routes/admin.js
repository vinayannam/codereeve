var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res) {
    res.render('add', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        admin: true,
        add: true
    });
});

router.get('/list', ensureAuthenticated, function(req, res) {
    res.render('list', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        admin: true,
        list: true
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
var express = require('express');
var router = express.Router();

router.get('/', ensureAuthenticated, function(req, res) {
    res.render('current', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        student: true,
        username: req.user.userName,
        name: `${req.user.lastName} ${req.user.firstName}`,
        current: true
    });
});

router.get('/previous', ensureAuthenticated, function(req, res) {
    res.render('previous', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        student: true,
        username: req.user.username,
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
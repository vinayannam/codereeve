var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

router.get('/login', function(req, res) {
    res.render('login', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        login: true
    });
});

passport.use(new LocalStrategy(
    function(username, password, done) {
        User.getUserByUsername(username, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: "I don't know you!" });
            }
            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Use correct password ' + user.username });
                }
            });
        });
    }));

passport.serializeUser(function(user, done) {
    done(null, user.id);
});

passport.deserializeUser(function(id, done) {
    User.getUserById(id, function(err, user) {
        done(err, user);
    });
});

router.post('/login',
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/brutelogin', failureFlash: true }),
    function(req, res) {
        req.flash('error_msg', 'You are an intruder!.');
        res.redirect('/users/login');
    });

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success_msg', 'Bye! Bye! Comrade!');
    res.redirect('/users/login');
});

router.get('/brutelogin', function(req, res) {
    req.flash('error_msg', 'You are an intruder!');
    res.redirect('/users/login');
});

module.exports = router;
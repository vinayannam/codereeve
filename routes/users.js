var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

var User = require('../models/user');

router.get('/register', function(req, res) {
    res.render('register', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        register: true
    });
});

router.get('/login', function(req, res) {
    res.render('login', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        login: true
    });
});

router.post('/register', function(req, res) {
    var userID = req.body.userID;
    var password = req.body.password;
    var type = req.body.type;
    var password2 = req.body.password2;

    req.checkBody('userID', 'UserID is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('type', 'Choose who the person is!').notEmpty();
    req.checkBody('password2', 'Passwords do not match').equals(req.body.password);

    var errors = req.validationErrors();

    if (errors) {
        res.render('register', {
            errors: errors
        });
    } else {
        var newUser = new User({
            userID: userID,
            password: password,
            type: type
        });

        User.createUser(newUser, function(err, user) {
            if (err) throw err;
        });

        req.flash('success_msg', 'You are registered and can now login');

        res.redirect('/users/login');
    }
});

passport.use(new LocalStrategy(
    function(userID, password, done) {
        User.getUserByUsername(userID, function(err, user) {
            if (err) throw err;
            if (!user) {
                return done(null, false, { message: "I don't know you!" });
            }
            User.comparePassword(password, user.password, function(err, isMatch) {
                if (err) throw err;
                if (isMatch) {
                    return done(null, user);
                } else {
                    return done(null, false, { message: 'Use correct password ' + user.userID });
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
    passport.authenticate('local', { successRedirect: '/', failureRedirect: '/users/login', failureFlash: true }),
    function(req, res) {
        req.flash('error_msg', "I don't know you.");
        res.redirect('/users/login');
    });

router.get('/logout', function(req, res) {
    req.logout();
    req.flash('success_msg', 'Bye! Bye! Comrade!');
    res.redirect('/users/login');
});

module.exports = router;
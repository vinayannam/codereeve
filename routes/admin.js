var express = require('express');
var router = express.Router();
var Subject = require('../models/subject.js');
var User = require('../models/user.js');


router.get('/', ensureAuthenticated, function(req, res) {
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth();
    var years;
    if (thisMonth > 6) {
        years = [{ year: thisYear - 3 }, { year: thisYear - 2 }, { year: thisYear - 1 }, { year: thisYear }]
    } else {
        years = [{ year: thisYear - 4 }, { year: thisYear - 3 }, { year: thisYear - 2 }, { year: thisYear - 1 }]
    }
    res.render('add', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
        years: years,
        admin: true,
        add: true
    });
});

router.get('/courses', ensureAuthenticated, function(req, res) {
    Subject.getAllEntries(function(err, result) {
        res.render('courses', {
            title: 'Code Reeve',
            link: req.protocol + '://' + req.get('host') + req.originalUrl,
            admin: true,
            courses: true,
            entries: result
        });
    })
});

router.get('/addcourse', ensureAuthenticated, function(req, res) {
    var thisYear = new Date().getFullYear();
    var thisMonth = new Date().getMonth();
    var years;
    var sems = [1, 2, 3, 4, 5, 6, 7, 8]
    if (thisMonth > 6) {
        years = [{ year: thisYear - 3 }, { year: thisYear - 2 }, { year: thisYear - 1 }, { year: thisYear }]
    } else {
        years = [{ year: thisYear - 4 }, { year: thisYear - 3 }, { year: thisYear - 2 }, { year: thisYear - 1 }]
    }
    User.getAllFaculty((result) => {
        res.render('addcourse', {
            title: 'Code Reeve',
            link: req.protocol + '://' + req.get('host') + req.originalUrl,
            admin: true,
            courses: true,
            years: years,
            sems: sems,
            faculties: result
        });
    })
});

router.post('/addcourse', ensureAuthenticated, function(req, res) {
    var subject = req.body.subject;
    var userName = req.body.username;
    var year = req.body.year;
    var section = req.body.section;
    var sem = req.body.sem;

    req.checkBody('subject', 'Subject is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('addcourse', {
            errors: errors
        });
    } else {
        var newSubject = new Subject({
            subject: subject,
            batch: section,
            year: year,
            faculty: userName,
            sem: sem
        });

        Subject.createSubject(newSubject, function(err, subject) {
            if (err) throw err;
        });

        req.flash('success_msg', 'Successfully added a Subject.');

        res.redirect('/admin/courses');
    }
});

router.get('/manage', ensureAuthenticated, function(req, res) {
    User.getAllUsers(function(result) {
        res.render('manage', {
            title: 'Code Reeve',
            link: req.protocol + '://' + req.get('host') + req.originalUrl,
            admin: true,
            manage: true,
            users: result
        });
    })
});


router.post('/manage', ensureAuthenticated, function(req, res) {
    var username = req.body.username
    var type = req.body.manage
    if (type == "edit") {
        var thisYear = new Date().getFullYear();
        var thisMonth = new Date().getMonth();
        var years;
        var sems = [1, 2, 3, 4, 5, 6, 7, 8]
        if (thisMonth > 6) {
            years = [{ year: thisYear - 3 }, { year: thisYear - 2 }, { year: thisYear - 1 }, { year: thisYear }]
        } else {
            years = [{ year: thisYear - 4 }, { year: thisYear - 3 }, { year: thisYear - 2 }, { year: thisYear - 1 }]
        }
        User.getUserByUsername(username, (err, user) => {
            if (err) throw err;
            user.admin = true
            user.years = years
            res.render('edit', user)
        });
    } else {
        User.deleteUser(username);
        req.flash('success_msg', 'Successfully Deleted.');
        res.redirect('/admin/manage');
    }
});

router.post('/coursesmanage', ensureAuthenticated, function(req, res) {
    Subject.deleteSubject({
        sem: req.body.sem,
        subject: req.body.subject,
        faculty: req.body.faculty,
        year: req.body.year,
        batch: req.body.batch
    });
    req.flash('success_msg', 'Successfully Deleted.');
    res.redirect('/admin/courses');
});

router.post('/edit', ensureAuthenticated, function(req, res) {
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var userName = req.body.username;
    var password = req.body.password;
    var user = req.body.user;
    var year = req.body.year;
    var section = req.body.section;

    var originalun = req.body.originalun;

    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('firstname', 'Firstname is required').notEmpty();
    req.checkBody('lastname', 'LastName is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('edit', {
            errors: errors
        });
    } else {
        var newUser = new User({
            firstName: firstName,
            lastName: lastName,
            userName: userName,
            password: password,
            user: user,
            year: year,
            section: section
        });

        User.deleteUser(originalun);

        User.createUser(newUser, function(err, user) {
            if (err) throw err;
        });

        req.flash('success_msg', 'Successfully Edited.');

        res.redirect('/admin/manage');
    }
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}

router.post('/register', function(req, res) {
    var firstName = req.body.firstname;
    var lastName = req.body.lastname;
    var userName = req.body.username;
    var password = req.body.password;
    var type = req.body.user;
    var year = req.body.year;
    var section = req.body.section;

    req.checkBody('username', 'Username is required').notEmpty();
    req.checkBody('password', 'Password is required').notEmpty();
    req.checkBody('firstname', 'Firstname is required').notEmpty();
    req.checkBody('lastname', 'LastName is required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('add', {
            errors: errors
        });
    } else {


        User.getUserByUsername(userName, (err, user) => {
            if (err) throw err;
            if (user == null) {
                var newUser = new User({
                    firstName: firstName,
                    lastName: lastName,
                    userName: userName,
                    password: password,
                    user: type,
                    year: year,
                    section: section
                });

                User.createUser(newUser, function(err, user) {
                    if (err) throw err;
                });

                req.flash('success_msg', 'Successfully Registered.');

                res.redirect('/admin/');
            } else {
                req.flash('error_msg', 'Username already exists.');

                res.redirect('/admin/');
            }

        })
    }
});


module.exports = router;
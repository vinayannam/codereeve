var express = require('express');
var router = express.Router();
var Subject = require('../models/subject.js');
var Assignment = require('../models/assignment.js');

router.get('/', ensureAuthenticated, function(req, res) {
    Subject.getSubjectByFaculty(req.user.userName, (err, result) => {
        if (err) throw err;
        subjects = []
        var thisMonth = new Date().getMonth();
        if (thisMonth > 6) {
            for (var i = 0; i < result.length; i++) {
                if (result[i].sem % 2 != 0) {
                    subjects.push(result[i])
                }
            }
        } else {
            for (var i = 0; i < result.length; i++) {
                if (result[i].sem % 2 == 0) {
                    subjects.push(result[i])
                }
            }
        }
        res.render('faculty', {
            title: 'Code Reeve',
            link: req.protocol + '://' + req.get('host') + req.originalUrl,
            faculty: true,
            subjects: subjects,
            add: true,
            name: req.user.userName
        });
    })
});

router.post('/temp', function(req, res) {

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.tcf;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(__dirname + '/uploads/left.png', function(err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
    });
});

router.get('/temp', function(req, res) {
    res.render('temp', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
    });
});

router.post('/assignment', ensureAuthenticated, (req, res) => {
    req.checkBody('subject', 'Subject is required').notEmpty();
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('desc', 'Description is required').notEmpty();
    req.checkBody('input', 'Input is required').notEmpty();
    req.checkBody('output', 'Output is required').notEmpty();
    req.checkBody('intest', 'Input testcases is required').notEmpty();
    req.checkBody('outtest', 'Output testcases is required').notEmpty();
    req.checkBody('datetime', 'Date and time are required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('faculty', {
            errors: errors
        })
    } else {
        var subject = req.body.subject.split(' ');
        var datetime = req.body.datetime;
        var td = new Date(datetime);
        let tcf = req.files.tcf;
        tcf.mv(__dirname + '/uploads/' + req.body.title + '-' + req.body.subject + '_in.txt', function(err) {
            if (err)
                return res.status(500).send(err);
        });
        let solution = req.files.solution;
        solution.mv(__dirname + '/uploads/' + req.body.title + '-' + req.body.subject + '_out.txt', function(err) {
            if (err)
                return res.status(500).send(err);
        });
        var newAssignment = new Assignment({
            subject: subject[0],
            section: subject[2],
            sem: subject[4][0],
            batch: subject[6].slice(0, subject[6].length - 1),
            faculty: req.body.facname,
            title: req.body.title,
            desc: req.body.desc,
            input: req.body.input,
            output: req.body.output,
            intest: req.body.intest,
            outtest: req.body.outtest,
            tcf: __dirname + '/uploads/' + req.body.title + '-' + req.body.subject + '_in.txt',
            solution: __dirname + '/uploads/' + req.body.title + '-' + req.body.subject + '_out.txt',
            datetime: td.toISOString()
        });

        Assignment.createAssignment(newAssignment, function(err, assignment) {
            if (err) throw err;
        });

        req.flash('success_msg', 'Successfully added an assignment.');

        res.redirect('/faculty/');
    }
})

router.get('/previous', ensureAuthenticated, function(req, res) {
    Assignment.getAllAssignmentsByFaculty(req.user.userName, function(err, result) {
        if (err) throw err;
        res.render('previous', {
            title: 'Code Reeve',
            link: req.protocol + '://' + req.get('host') + req.originalUrl,
            faculty: true,
            previous: true,
            assignment: result
        });
    })
});

router.post('/manage', ensureAuthenticated, function(req, res) {
    var id = req.body.id;
    var type = req.body.manage
    if (type == "edit") {
        Assignment.getAssignmentByID(id, (err, assignment) => {
            if (err) throw err;
            var datetime = new Date(assignment.datetime)
            assignment.newdatetime = datetime.toLocaleString()
            res.render('editassignment', assignment)
        });
    } else if (type = "sub") {
        res.render('submissions', { id: id, faculty: true })
    } else {
        Assignment.deleteAssignment(id);
        req.flash('success_msg', 'Successfully Deleted.');
        res.redirect('/faculty/previous');
    }
});

router.post('/edit', ensureAuthenticated, function(req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('desc', 'Description is required').notEmpty();
    req.checkBody('input', 'Input is required').notEmpty();
    req.checkBody('output', 'Output is required').notEmpty();
    req.checkBody('intest', 'Input testcases is required').notEmpty();
    req.checkBody('outtest', 'Output testcases is required').notEmpty();
    req.checkBody('datetime', 'Date and time are required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
        res.render('faculty', {
            errors: errors
        })
    } else {
        var datetime = req.body.datetime;
        var td = new Date(datetime);
        let tcf = req.files.tcf;
        if (tcf != null) {
            tcf.mv(req.body.tcf, function(err) {
                if (err)
                    return res.status(500).send(err);
            });
        }
        let solution = req.files.solution;
        if (solution != null) {
            solution.mv(req.body.solution, function(err) {
                if (err)
                    return res.status(500).send(err);
            });
        }
        var newAssignment = {
            title: req.body.title,
            desc: req.body.desc,
            input: req.body.input,
            output: req.body.output,
            intest: req.body.intest,
            outtest: req.body.outtest,
            tcf: req.body.tcf,
            solution: req.body.solution,
            datetime: td.toISOString()
        };

        Assignment.updateAssignment(req.body.id, newAssignment, function(err, assignment) {
            if (err) throw err;
        });

        req.flash('success_msg', 'Successfully edited an assignment.');

        res.redirect('/faculty/previous');
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
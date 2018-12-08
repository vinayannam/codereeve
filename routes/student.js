var express = require('express');
var router = express.Router();
var Assignment = require('../models/assignment.js');
var Submission = require('../models/submission.js');
const fs = require('fs');
const { c, cpp, node, python, java } = require('compile-run');

router.get('/', ensureAuthenticated, function(req, res) {
    Assignment.getAssignmentByClass(String(req.user.section).toUpperCase(), req.user.year, function(err, result) {
        if (err) throw err;
        res.render('current', {
            title: 'Code Reeve',
            link: req.protocol + '://' + req.get('host') + req.originalUrl,
            student: true,
            username: req.user.userName,
            name: `${req.user.lastName} ${req.user.firstName}`,
            current: true,
            assignment: result
        });
    })
});

router.post('/assignment', ensureAuthenticated, function(req, res) {
    var sub = true
    if (req.body.expired == 'yes') {
        sub = false
    }
    Assignment.getAssignmentByID(req.body.id, (err, result) => {
        if (err) throw err;
        res.render('assignment', {
            title: 'Code Reeve',
            link: req.protocol + '://' + req.get('host') + req.originalUrl,
            student: true,
            username: req.user.userName,
            assignment: result,
            sub: sub
        });
    });
})

router.post('/saved', ensureAuthenticated, function(req, res) {
    Assignment.getAssignmentByID(req.body.assignmentID, (err, result) => {
        if (err) throw err;
        Submission.getSubmissionByUA(result._id, req.user.userName, (err, result2) => {
            if (err) throw err;
            var opp = 0;
            var lang = []
            if (result2.length == 0) {
                res.send(lang)
            } else {
                result2.forEach(element => {
                    fs.readFile("allSubmissions/" + element.file, "utf8", function(err, code) {
                        if (err) {
                            return console.error(err);
                        }
                        lang.push({ code: code, type: element.type })
                        operation()
                    });
                });

                function operation() {
                    opp++
                    if (opp == result2.length) {
                        res.send(lang)
                    }
                }
            }
        });
    });
})

router.post('/run', ensureAuthenticated, function(req, res) {
    var file = req.body.user + '_' + req.body.assignmentID + '/Problem.' + req.body.type;
    var compiler = c;
    if (req.body.type == 'c') {
        compiler = c
    } else if (req.body.type == 'cpp') {
        compiler = cpp
    } else if (req.body.type == 'java') {
        compiler = java
    } else if (req.body.type == 'py') {
        compiler = python
    }

    Assignment.getAssignmentByID(req.body.assignmentID, (err, result) => {
        if (err) throw err;
        var tcf = result.tcf;
        var solution = result.solution;
        var tcfS = tcf.split('/')
        tcf = 'routes/uploads/' + tcfS[tcfS.length - 1]
        var solS = solution.split('/')
        solution = 'routes/uploads/' + solS[solS.length - 1]
        fs.readFile(tcf, "utf8", function(err, code) {
            if (err) {
                return console.error(err);
            }
            let resultPromise = compiler.runFile("allSubmissions/" + file, { stdin: code });
            resultPromise
                .then(result => {
                    if (result.exitCode == 1 || result.exitCode == null) {
                        res.send(result)
                        return;
                    } else {
                        fs.readFile(solution, "utf8", function(err, output) {
                            var score = 0;
                            var splitOutput = output.split('\n')
                            var splitStdout = result.stdout.split('\n')
                            splitOutput = splitOutput.filter(function(el) {
                                return el != '';
                            });
                            splitStdout = splitStdout.filter(function(el) {
                                return el != '';
                            });
                            if (splitOutput.length != splitStdout.length) {
                                res.send({ exitCode: 1, errorType: 'Less output lines.' })
                                return;
                            }
                            var sol = [];
                            for (var i = 0; i < splitOutput.length; i++) {
                                if (splitOutput[i] === splitStdout[i]) {
                                    sol.push(true)
                                    score++;
                                } else {
                                    sol.push(false)
                                }
                            }
                            Submission.addScore(score, req.body.user, req.body.assignmentID, req.body.type, (err, result) => {
                                if (err) throw err;

                            });
                            res.send({ exitCode: 0, stdout: sol })
                        })
                    }
                })
                .catch(err => {
                    res.send(err)
                });
        });
    });
})

router.post('/submit', ensureAuthenticated, function(req, res) {
    Submission.updateSubmission2(req.body.user, req.body.assignmentID, req.body.type, (err, result) => {
        if (err) throw err;
    });
    res.send({})
})

router.post('/submitted', ensureAuthenticated, function(req, res) {
    var assignmentID = req.body.assignmentID;
    Submission.getSubmissionByA(assignmentID, function(err, subissions) {
        if (err) throw err;
        var out = []
        subissions.forEach(element => {
            if (element.submitted == true) {
                out.push({
                    user: element.user,
                    datetime: (new Date(element.datetime)).toLocaleString(),
                    type: element.type,
                    score: element.score
                })
            }
        })
        res.send(out)
    });
});

router.post('/save', ensureAuthenticated, function(req, res) {
    var code = req.body.text;
    var type = req.body.type;
    var username = req.user.userName;
    var assignmentID = req.body.assignmentID;
    var datetime = new Date();
    var file = username + '_' + assignmentID + '/Problem.' + type;
    Submission.updateSubmission(code, file, username, type, datetime, assignmentID, function(err, submission) {
        if (err) throw err;
    });
});

router.get('/previous', ensureAuthenticated, function(req, res) {
    Assignment.getOldAssignmentByClass(String(req.user.section).toUpperCase(), req.user.year, function(err, result) {
        if (err) throw err;
        res.render('old', {
            title: 'Code Reeve',
            link: req.protocol + '://' + req.get('host') + req.originalUrl,
            student: true,
            username: req.user.userName,
            name: `${req.user.lastName} ${req.user.firstName}`,
            previous: true,
            assignment: result
        });
    })
});

function ensureAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    } else {
        res.redirect('/users/login');
    }
}


module.exports = router;
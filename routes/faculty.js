var express = require('express');
var router = express.Router();
var Subject = require('../models/subject.js');
var Assignment = require('../models/assignment.js');
var Submission = require('../models/submission.js');
const fs = require('fs');
const { c, cpp, node, python, java } = require('compile-run');
var glob = require("glob")
let { PythonShell } = require('python-shell');

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

router.post('/temp', ensureAuthenticated, function(req, res) {

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.tcf;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(__dirname + '/uploads/left.png', function(err) {
        if (err)
            return res.status(500).send(err);

        res.send('File uploaded!');
    });
});

router.get('/temp', ensureAuthenticated, function(req, res) {
    res.render('temp', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl,
    });
});

router.post('/plagiarism', ensureAuthenticated, function(req, res) {
    Submission.normAndGetSubmissionByA(req.body.assignmentID, function(err, subissions) {
        if (err) throw err;
        var out = []
        subissions.forEach(element => {
            if (element.submitted == true) {
                out.push({
                    user: element.user,
                    datetime: (new Date(element.datetime)).toLocaleString(),
                    type: element.type,
                    score: element.score,
                    plagiarism: element.plagiarism,
                    assignmentID: element.assignmentID,
                })
            }
        })
        if (req.body.plagiarised == 'true') {
            res.render('submissions', { entries: out, faculty: true, ass: req.body.assignmentID, plagiarised: req.body.plagiarised, pc: true })
        } else {
            res.render('submissions', { entries: out, faculty: true, ass: req.body.assignmentID, plagiarised: req.body.plagiarised, pcn: true })
        }
    });
});

router.post('/assignment', ensureAuthenticated, (req, res) => {
    req.checkBody('subject', 'Subject is required').notEmpty();
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('desc', 'Description is required').notEmpty();
    req.checkBody('intest', 'Input testcases is required').notEmpty();
    req.checkBody('outtest', 'Output testcases is required').notEmpty();
    req.checkBody('datetime', 'Date and time are required').notEmpty();

    var errors = req.validationErrors();

    if (errors) {
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
                errors: errors,
                title: 'Code Reeve',
                link: req.protocol + '://' + req.get('host') + req.originalUrl,
                faculty: true,
                subjects: subjects,
                add: true,
                name: req.user.userName
            });
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

router.post('/saved', ensureAuthenticated, function(req, res) {
    Assignment.getAssignmentByID(req.body.assignmentID, (err, result) => {
        if (err) throw err;
        Submission.getSubmissionByUA(result._id, req.body.userName, (err, result2) => {
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

router.post('/check', ensureAuthenticated, function(req, res) {
    Submission.getSubmissionByAS(req.body.assignmentID, function(err, result) {
        if (err) throw err;
        cA = []
        cppA = []
        javaA = []
        pythonA = []
        result.forEach(element => {
            if (element.type == 'c') {
                cA.push(element.file)
            }
            if (element.type == 'cpp') {
                cppA.push(element.file)
            }
            if (element.type == 'java') {
                javaA.push(element.file)
            }
            if (element.type == 'py') {
                pythonA.push(element.file)
            }
        });
        argsAL = [
            ['c', cA],
            ['cpp', cppA],
            ['java', javaA],
            ['python', pythonA]
        ]
        argsAL.forEach((args, index, array) => {
            script([args[0]], args[1])
            if (index == array.length - 1) {
                cbrl(req.body.assignmentID, req, res);
            }
        })

        function script(args, arr) {
            arr.forEach(file => {
                args.push(file)
            })
            var options = {
                mode: 'text',
                pythonPath: '/Library/Frameworks/Python.framework/Versions/3.7/bin/python3',
                pythonOptions: null,
                scriptPath: __dirname + '/../allSubmissions',
                args: args
            }
            PythonShell.run('moss.py', options, (err, result) => {
                if (err) throw err;
                a = result[0]
                a = a.replace(/'/g, '"');
                a = JSON.parse(a)
                plag = []
                a.forEach(ele => {
                    s = ele.split(' ')
                    for (var i = 0; i < s.length; i += 2) {
                        var numb = s[i + 1].match(/\d/g);
                        numb = numb.join("");
                        Submission.updatePlagiarismByF(numb, s[i], (err, submission) => {
                            if (err) throw err;
                        })
                    }
                })
            })
        }

        function cbrl(id, req, res) {
            Assignment.updateCheckedByID(id, function(err, result) {
                if (err) throw err;
            })
        }

    })
})

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
    } else if (type == "sub") {
        Submission.getSubmissionByA(id, function(err, subissions) {
            if (err) throw err;
            var out = []
            subissions.forEach(element => {
                if (element.submitted == true) {
                    out.push({
                        user: element.user,
                        datetime: (new Date(element.datetime)).toLocaleString(),
                        type: element.type,
                        score: element.score,
                        plagiarism: element.plagiarism,
                        assignmentID: element.assignmentID
                    })
                }
            })
            if (req.body.plagiarised == 'true') {
                res.render('submissions', { entries: out, faculty: true, ass: id, plagiarised: req.body.plagiarised, pc: true })
            } else {
                res.render('submissions', { entries: out, faculty: true, ass: id, plagiarised: req.body.plagiarised, pcn: true })
            }
        });
    } else if (type == 'delete') {
        Assignment.deleteAssignment(id);
        req.flash('success_msg', 'Successfully Deleted.');
        res.redirect('/faculty/previous');
    }
});

router.post('/edit', ensureAuthenticated, function(req, res) {
    req.checkBody('title', 'Title is required').notEmpty();
    req.checkBody('desc', 'Description is required').notEmpty();
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
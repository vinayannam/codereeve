var mongoose = require('mongoose');
const fs = require('fs');

// Assignment Schema
var SubmissionSchema = mongoose.Schema({
    user: {
        type: String
    },
    type: {
        type: String
    },
    assignmentID: {
        type: String
    },
    file: {
        type: String
    },
    datetime: {
        type: Date,
        index: true,
        default: Date.now()
    }
});

var Submission = module.exports = mongoose.model('Submission', SubmissionSchema);

module.exports.createSubmission = function(nS, callback) {
    nS.save(callback);
}

module.exports.updateSubmission = function(code, file, user, type, datetime, assignmentID, callback) {
    var query = { user: user, assignmentID: assignmentID, type: type }
    Submission.find(query, function(err, res) {
        if (err) throw err;
        if (res.length == 0) {
            var newSubmission = new Submission({
                user: user,
                assignmentID: assignmentID,
                file: file,
                type: type,
                datetime: datetime.toISOString()
            });
            newSubmission.save(callback);
            fs.mkdir('allSubmissions/' + user + '_' + assignmentID, (err) => {
                if (err) {
                    return console.error(err);
                }
            });
        }
        fs.writeFile("allSubmissions/" + file, code, function(err) {
            if (err) {
                return console.error(err);
            }
        });
    })
}

module.exports.getSubmissionByUA = function(assignmentID, user, callback) {
    var query = { user: user, assignmentID: assignmentID }
    Submission.find(query, callback)
}

module.exports.getSubmissionByA = function(assignmentID, callback) {
    var query = { assignmentID: assignmentID }
    Submission.find(query, callback)
}
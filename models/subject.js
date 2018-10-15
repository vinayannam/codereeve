var mongoose = require('mongoose');
var bc = require('bcryptjs');

// Subject Schema
var SubjectSchema = mongoose.Schema({
    subject: {
        type: String
    },
    batch: {
        type: String
    },
    year: {
        type: Number
    },
    faculty: {
        type: String
    },
    sem: {
        type: Number
    }
});

var Subject = module.exports = mongoose.model('Subject', SubjectSchema);

module.exports.getSubjectByYear = function(year, callback) {
    var query = { year: year };
    Subject.findOne(query, callback);
}

module.exports.getSubjectByCode = function(subjectCode, callback) {
    var query = { subjectCode: subjectCode };
    Subject.find(query, callback);
}

module.exports.createSubject = function(nS, callback) {
    nS.save(callback);
}

module.exports.getSubjects = function(callback) {
    Subject.find().distinct('subject', callback);
}

module.exports.getAllEntries = function(callback) {
    Subject.find({}, callback)
}
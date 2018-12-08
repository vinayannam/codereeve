var mongoose = require('mongoose');

// Assignment Schema
var AssignmentSchema = mongoose.Schema({
    subject: {
        type: String
    },
    section: {
        type: String
    },
    sem: {
        type: Number
    },
    batch: {
        type: String
    },
    faculty: {
        type: String
    },
    title: {
        type: String
    },
    desc: {
        type: String
    },
    input: {
        type: String
    },
    output: {
        type: String
    },
    intest: {
        type: String
    },
    outtest: {
        type: String
    },
    tcf: {
        type: String
    },
    solution: {
        type: String
    },
    datetime: {
        type: Date,
        index: true,
        default: Date.now()
    },
    checked: {
        type: Boolean,
        default: false
    },
    plagiarised: {
        type: Boolean,
        default: false
    }
});

var Assignment = module.exports = mongoose.model('Assignment', AssignmentSchema);

module.exports.createAssignment = function(nA, callback) {
    nA.save(callback);
}

module.exports.getAllAssignmentsByFaculty = function(fac, callback) {
    var query = { faculty: fac };
    Assignment.find(query, callback);
}

module.exports.getAssignmentByID = function(id, callback) {
    Assignment.findById(id, callback);
}

module.exports.deleteAssignment = function(id) {
    Assignment.findById(id, (err, res) => {
        if (err) return handleError(err);
        Assignment.deleteOne(res, function(err) {
            if (err) return handleError(err);
        });
    });
}

module.exports.updateAssignment = function(id, newA, callback) {
    Assignment.updateOne({ _id: id }, { $set: newA }, callback);
}

module.exports.getAssignmentByClass = (sec, year, callback) => {
    var query = { section: sec, batch: year, datetime: { $gt: new Date() } };
    Assignment.find(query, callback);
}

module.exports.getOldAssignmentByClass = (sec, year, callback) => {
    var query = { section: sec, batch: year, datetime: { $lt: new Date() } };
    Assignment.find(query, callback);
}

module.exports.updateCheckedByID = function(id, callback) {
    Assignment.updateOne({ _id: id }, { $set: { checked: true } }, callback);
}
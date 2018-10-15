var mongoose = require('mongoose');
var bc = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    userName: { type: String },
    password: { type: String },
    user: { type: String },
    year: { type: String },
    section: { type: String }
});

var User = module.exports = mongoose.model('User', UserSchema);

module.exports.createUser = function(nU, callback) {
    bc.genSalt(10, function(err, s) {
        bc.hash(nU.password, s, function(err, hash) {
            nU.password = hash;
            nU.save(callback);
        });
    });
}

module.exports.getUserByUsername = function(username, callback) {
    var query = { userName: username };
    User.findOne(query, callback);
}

module.exports.getUserById = function(id, callback) {
    User.findById(id, callback);
}

module.exports.comparePassword = function(password, hash, callback) {
    bc.compare(password, hash, function(err, isMatch) {
        if (err) throw err;
        callback(null, isMatch);
    });
}

module.exports.getAllUsers = function(callback) {
    User.where('user').ne('admin').then(callback)
}

module.exports.getAllFaculty = function(callback) {
    User.where('user').equals('faculty').then(callback)
}

module.exports.deleteUser = function(username) {
    User.deleteOne({ userName: username }, function(err) {
        if (err) return handleError(err);
    });
}
var mongoose = require('mongoose');
var bc = require('bcryptjs');

// User Schema
var UserSchema = mongoose.Schema({
    userID: {
        type: String,
        index: true
    },
    password: {
        type: String
    },
    type: {
        type: String
    }
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

module.exports.getUserByUsername = function(userID, callback) {
    var query = { userID: userID };
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
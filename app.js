var express = require('express');
var bodyParser = require('body-parser');
var exphbs = require('express-handlebars');
var mongo = require('mongodb');
var mongoose = require('mongoose');
var flash = require('connect-flash');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');
var expressValidator = require('express-validator');

// mongoose.connect('mongodb://localhost/codereeve', { useNewUrlParser: true });
// mongoose.set('useCreateIndex', true);
// var db = mongoose.connection;

var db;

mongo.MongoClient.connect('mongodb://localhost/codereeve' || process.env.MONGOLAB_URI, { useNewUrlParser: true }, function(err, client) {
    if (err) {
        console.log(err);
        process.exit(1);
    }
    db = client.db();
    console.log("Database connection ready");
    var server = app.listen(process.env.PORT || 3000, function() {
        var port = server.address().port;
        console.log("App now running on port", port);
    });
});

var routes = require('./routes/index');
var users = require('./routes/users');
var admin = require('./routes/admin');
var faculty = require('./routes/faculty');
var student = require('./routes/student');

var path = require('path');

var app = express();
app.enable('trust proxy')

app.use('/', express.static(path.join(__dirname, 'public')));
app.use('/users', express.static(path.join(__dirname, 'public')));
app.use('/admin', express.static(path.join(__dirname, 'public')));
app.use('/faculty', express.static(path.join(__dirname, 'public')));
app.use('/student', express.static(path.join(__dirname, 'public')));

app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', exphbs({ defaultLayout: 'layout' }));
app.set('view engine', 'handlebars');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

app.use(session({
    secret: 'secret',
    saveUninitialized: true,
    resave: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator({
    errorFormatter: function(param, msg, value) {
        var namespace = param.split('.'),
            root = namespace.shift(),
            formParam = root;

        while (namespace.length) {
            formParam += '[' + namespace.shift() + ']';
        }
        return {
            param: formParam,
            msg: msg,
            value: value
        };
    }
}));

app.use(flash());

app.use(function(req, res, next) {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    res.locals.user = req.user || null;
    next();
});

app.use('/', routes);
app.use('/users', users);
app.use('/admin', admin);
app.use('/faculty', faculty);
app.use('/student', student);
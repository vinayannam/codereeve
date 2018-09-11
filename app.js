var express = require('express');

var app = express();

var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

var routes = require('./routes');

var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.engine('html', require('ejs').renderFile);

app.set('view engine', 'html');

app.get('/', routes.home);

app.get('*', routes.home);

app.listen(process.env.PORT || 3000);
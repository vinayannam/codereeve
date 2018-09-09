const express = require('express');

var app = express();

var bodyParser = require('body-parser');

var urlencodedParser = bodyParser.urlencoded({
    extended: false
});

var routes = require('./routes');

var path = require('path');

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'handlebars');

app.get('/', routes.home);

app.get('*', routes.notFound);

app.listen(process.env.PORT || 3000);
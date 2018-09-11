exports.home = function(req, res) {
    res.render('home', {
        title: 'Code Reeve',
        link: req.protocol + '://' + req.get('host') + req.originalUrl
    });
};
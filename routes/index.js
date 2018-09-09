exports.home = function(req, res) {
    res.render('home', {
        title: 'Code Reeve'
    });
};

exports.notFound = function(req, res) {
    res.render('notFound', {
        title: "Oops, this page doesn't exist"
    });
};
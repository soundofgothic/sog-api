const express = require('express');
var cors = require('cors');
const app = express();

// add logging middleware
app.use(function (req, res, next) {
    console.log(req.method + ' ' + req.url);
    next();
});

app.use(express.json());
app.use(cors());

require('./controllers/basic.controller')(app);
require('./controllers/user.controller')(app);
require('./controllers/reports.controller')(app);
require('./controllers/sfx.controller')(app);

app.use(function (err, req, res, next) {
    if (err.name === 'UnauthorizedError') {
        res.status(401).send('invalid token');
    } else {
        next(err);
    }
});

app.listen(3000, '0.0.0.0', () => console.log('App listening on port 3000!'));

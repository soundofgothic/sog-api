var jwt = require('jsonwebtoken');
var MongoClient = require('mongodb').MongoClient;
var url = require('./config').mongoConnection;
var dbname = require('./config').dbName;
var secret = process.env.SECRET || require('./config').secret;
var tokenExpirationTime = require('./config').tokenExpirationTime;

getSecret = function (req, payload, done) {
    if (done)
        done(null, secret);
    else
        return secret;
};


getToken = function (req) {
    if (req.headers.authorization && req.headers.authorization.split(' ')[0] === 'Bearer') {
        return req.headers.authorization.split(' ')[1];
    } else if (req.query && req.query.token) {
        return req.query.token;
    }
    return null;
};

getUserFromToken = function (req, token) {
    var token = token || getToken(req);
    try {
        return jwt.verify(token, getSecret({}, {}));
    } catch (err) {
        return false;
    }
};

getDbConnection = function () {
    return MongoClient.connect(url);
};

generateToken = function (user) {
    return jwt.sign({
        sub: user.email,
        id: user._id,
    }, secret, {
        // expiresIn: 48 * 60 * 60,
        expiresIn: tokenExpirationTime
    });
};

module.exports = {
    getToken: getToken,
    getSecret: getSecret,
    getDbConnection: getDbConnection,
    generateToken: generateToken,
    getUserFromToken: getUserFromToken,
    dbname: dbname
};

let userService = require('../services/user.service');
let expressJwt = require('express-jwt');
let utils = require('../utils');

module.exports = function (app) {

    app.use('/user/*', expressJwt({
        secret: utils.getSecret,
        getToken: utils.getToken,
    }).unless({path: ['/user/auth', '/user/create']}));


    app.post('/user/auth', function (req, res) {
        let theUser = {
            email: req.body.email,
            password: req.body.password
        };
        userService.authenticate(theUser)
            .then((data) => res.json(data))
            .catch((err) => res.status(400).json({msg: "Zły login lub hasło"}));
    });

    app.post("/user/logged", function (req, res) {
        res.json({
            logged: true
        }); //if not, jwt should not allow to get here
    });

    // app.post('/user/create', (req, res) => {
    //     let newUser = {
    //         email: req.body.email,
    //         password: req.body.password
    //     };
    //     userService.createUser(newUser).then(() => res.json({status: 'ok'})).catch((err) => {
    //         res.status(400);
    //         res.json({error: err, status: 'bad'});
    //     });
    // });
};

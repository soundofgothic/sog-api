var getDbConnection = require('../utils').getDbConnection;
var dbname = require('../utils').dbname;
var generateToken = require('../utils').generateToken;
var bcrypt = require('bcryptjs');


module.exports.createUser = function(newUser) {
    return new Promise((resolve, reject)=>{
        getDbConnection().then((client)=>{
            var db = client.db(dbname);
            db.collection('users').findOne({email:newUser.email},(err,user)=>{
                if(err){
                    console.log('Error getting users list:'+err);
                    reject("Internal error");
                    client.close();
                }
                else if(!user){
                    bcrypt.hash(newUser.password, 10, (err, hash) => {
                        if(err){
                            console.log('Error hashing password:'+err);
                            reject("Internal error");
                            client.close();
                        }else{
                            newUser.hash=hash;
                            delete newUser.password;

                            db.collection('users').insertOne(newUser,(err,data)=>{
                                if(err) {
                                    console.log('Error adding new user:'+err);
                                    reject("Internal error")
                                }
                                else resolve(data);
                                client.close();
                            });
                        }
                    });
                }else{
                    reject("User exist");
                }
            });
        });
    });
};

module.exports.authenticate = function(theUser) {
    return new Promise((resolve, reject)=>{
        getDbConnection().then((client)=>{
            var db = client.db(dbname);
            db.collection('users').findOne({email:theUser.email},(err,user)=>{
                if(err){
                    console.log('Error getting users list:'+err);
                    reject("Internal error");
                    client.close();
                }
                else if(user){
                    bcrypt.compare(theUser.password, user.hash, (err, auth) => {
                        if(err){
                            console.log('Error unhashing password:'+err);
                            reject("Internal error");
                            client.close();
                        }else if (auth){
                            resolve({
                                user: user.email,
                                token: generateToken(user)
                            });
                        }else{
                            reject("Bad user or password");
                        }
                        client.close();
                    });


                }else{
                    console.log('Bad user:' +theUser.email);
                    reject("Bad user or password")
                    client.close();
                }
            });
        });

    });
};

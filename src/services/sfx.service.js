let getDbConnection = require('../utils').getDbConnection;
let dbname = require('../utils').dbname;
let ObjectId = require('mongodb').ObjectId;

module.exports.searchSFX = function (filter, tags, pageSize, pageNumber, solved) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            var db = client.db(dbname);
            var sounds = db.collection('sfx');
            sounds.createIndex({
                "description": "text",
                "filename": "text"
            }).then(() => {
                let query = {
                    tags: tags,
                    $or: [{description: new RegExp(filter, "i")}, {filename: new RegExp(filter, "i")}]
                };
                if(solved !== undefined && solved !== null) {
                    query.solved = solved;
                }
                let soundQuery = sounds.find(query)
                    .sort({reported: -1})
                    .skip(pageSize * pageNumber)
                    .limit(pageSize);

                let totalCount = soundQuery.count();

                Promise.all([soundQuery.toArray(), totalCount]).then(([records, count]) => {
                    resolve({
                        records: records,
                        recordCountTotal: count
                    });
                }).finally(() => client.close());

            });
        });
    });
};

module.exports.reportSFX = function (id, description, tags) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            let db = client.db(dbname);
            let sounds = db.collection('sfx');
            let update = sounds.updateOne({_id: ObjectId(id)}, {
                $inc: {"reported": 1},
                $push: {r_descriptions: description},
                $addToSet: {r_tags: {$each: tags}}
            })
                .then(data => resolve(data))
                .finally(() => client.close());
        })
    })
};

module.exports.resolveDescriptionSFX = function (id, description, solved) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            let db = client.db(dbname);
            let sfx = db.collection('sfx');
            let users = db.collection('users');
            let updateSFX = sfx.updateOne({_id: ObjectId(id)}, {
                $set: {
                    "description": description,
                    "reported": 0,
                    "solved": solved
                }, $unset: {"r_descriptions": ""}
            });
            let updateUser = users.updateOne({_id: ObjectId(userId)}, {
                $inc: {"actions": 1},
                $push: {"sfx_modified": ObjectId(id)}
            });
            Promise.all([updateSFX, updateUser]).then(() => {
                resolve({status: "ok"});
            }).catch((err) => {
                resolve({status: "err"})
            }).finally(() => client.close());
        });
    });
};

module.exports.resolveTagsSFX = function (id, tags, solved) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            let db = client.db(dbname);
            let sfx = db.collection('sfx');
            let users = db.collection('users');
            let updateSFX = sfx.updateOne({_id: ObjectId(id)}, {
                $set: {"reported": 0, "solved": solved},
                $addToSet: {tags: {$each: tags}}
            });
            let updateUser = users.updateOne({_id: ObjectId(userId)}, {
                $inc: {"actions": 1},
                $push: {"sfx_modified": ObjectId(id)}
            });
            Promise.all([updateSFX, updateUser]).then(() => {
                resolve({status: "ok"});
            }).catch((err) => {
                resolve({status: "err"})
            }).finally(() => client.close());
        });
    });
};

module.exports.deleteReportSFX = function (id, userId) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            let db = client.db(dbname);
            let sfx = db.collection('sfx');
            let users = db.collection('users');
            let updateSFX = texts.updateOne({_id: ObjectId(id)}, {
                $set: {"reported": 0, "solved": true},
                $unset: {"r_descriptions": "", "r_tags": ""}
            });
            let updateUser = users.updateOne({_id: ObjectId(userId)}, {
                $inc: {"actions": 1},
                $push: {"denied_sfx": ObjectId(id)}
            });
            Promise.all([updateSFX, updateUser]).then(() => {
                resolve({status: "ok"});
            }).catch((err) => {
                resolve({status: "err"})
            }).finally(() => client.close());
        });
    });
};

module.exports.deleteEntrySFX = function (id, userId) {
    return new Promise(async (resolve, reject) => {
        getDbConnection().then(async (client) => {
            let db = client.db(dbname);
            let sfx = db.collection('sfx');
            let users = db.collection('users');
            let deletedSFX = await sfx.findOne({_id: ObjectId(id)});
            users.updateOne({_id: ObjectId(userId)}, {$inc: {"actions": 1}, $push: {"deleted": deletedSFX}})
                .then(() => {
                    texts.remove({_id: ObjectId(id)}, true).then((status) => resolve(status))
                }).finally(() => client.close());
        });
    });
};



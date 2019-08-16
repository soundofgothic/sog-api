let getDbConnection = require('../utils').getDbConnection;
let dbname = require('../utils').dbname;
let ObjectId = require('mongodb').ObjectId;


module.exports.searchSFX = function (config) {
    return new Promise((resolve, reject) => {

        let filter = config.filter;
        let tags = config.tags;
        let pageSize = config.pageSize;
        let pageNumber = config.page;
        let solved = config.solved;
        let sortField = config.sortField;
        let sortOrder = config.sortOrder;
        let versions = config.versions;

        getDbConnection().then((client) => {
            var db = client.db(dbname);
            var sounds = db.collection('sfx');
            sounds.createIndex({
                "description": "text",
                "filename": "text"
            }).then(() => {
                let query = {
                    $or: [{description: new RegExp(filter, "i")}, {filename: new RegExp(filter, "i")}]
                };
                if (solved !== undefined && solved !== null) {
                    query.solved = solved;
                }
                if (tags.length > 0) {
                    if (tags.includes('null') && tags.length === 1) {
                        query.tags = {$eq: []};
                    } else if (!tags.includes('all')) {
                        query.tags = {$all: tags}
                    }
                }

                query.g = {$in : versions};

                let sort = {};
                if(sortField !== 'not-set') {
                    sort[sortField] = sortOrder;
                }

                let soundQuery = sounds.find(query)
                    .sort(sort)
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

module.exports.resolveSFX = function (id, description, tags, userId, solved) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            let db = client.db(dbname);
            let sfx = db.collection('sfx');
            let users = db.collection('users');
            let updateSFX = sfx.updateOne({_id: ObjectId(id)}, {
                $set: {"reported": 0, "solved": solved, "tags": tags, "description": description},
                $unset: {"r_descriptions": "", "r_tags": ""}
                // $addToSet: {tags: {$each: tags}}
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

module.exports.getSFXTags = function () {
    return new Promise((resolve, reject) => {
        getDbConnection().then(async (client) => {
            let db = client.db(dbname);
            let sfx = db.collection('sfx');
            let tagsCounted = sfx.aggregate([{$project: {tags: 1}}, {$unwind: "$tags"}, {
                $group: {
                    _id: "$tags",
                    count: {"$sum": 1}
                }
            }, {$sort: {count: -1}}]).toArray();
            let untaggedCounter = sfx.countDocuments({tags: {$size: 0}});
            Promise.all([tagsCounted, untaggedCounter]).then(([tagsCounter, untaggedCounter]) => {
                tagsCounter.push({_id: "null", count: untaggedCounter});
                resolve(tagsCounter);
            }).finally(() => client.close());
        });
    });
};



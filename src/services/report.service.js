var getDbConnection = require('../utils').getDbConnection;
var dbname = require('../utils').dbname;
let ObjectId = require('mongodb').ObjectId;

module.exports.searchReports = function (filter, pageSize, pageNumber) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            var db = client.db(dbname);
            var texts = db.collection('texts');
            texts.createIndex({
                "text": "text",
                "filename": "text",
                "source": "text"
            }).then(() => {

                var textQuery = texts.find({reported: {$gt: 0}, text: new RegExp(filter, "i")})
                    .sort({reported: -1})
                    .skip(pageSize * pageNumber)
                    .limit(pageSize);

                var totalCount = textQuery.count();

                Promise.all([textQuery.toArray(), totalCount]).then(([records, count]) => {
                    resolve({
                        records: records,
                        recordCountTotal: count
                    });
                }).finally(() => client.close());

            });
        });
    });
};

module.exports.resolveReport = function (id, newText, userId) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            var db = client.db(dbname);
            var texts = db.collection('texts');
            var users = db.collection('users');
            let updateText = texts.updateOne({_id: ObjectId(id)}, { $set: { "text" : newText, "reported" : 0 }, $unset: { "details": "" } });
            let updateUser = users.updateOne({_id: ObjectId(userId)}, { $inc: { "actions": 1 }, $push: { "modified": ObjectId(id) } });
            Promise.all([updateText, updateUser]).then(()=>{
                resolve({status: "ok"});
            }).catch((err)=>{
                resolve({status: "err"})
            }).finally(() => client.close());
        });
    });
};

module.exports.deleteReport = function (id, userId) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            var db = client.db(dbname);
            var texts = db.collection('texts');
            var users = db.collection('users');
            let updateText = texts.updateOne({_id: ObjectId(id)}, { $set: { "reported" : 0 }, $unset: { "details": "" } });
            let updateUser = users.updateOne({_id: ObjectId(userId)}, { $inc: { "actions": 1 }, $push: { "denied": ObjectId(id) } });
            Promise.all([updateText, updateUser]).then(()=>{
                resolve({status: "ok"});
            }).catch((err)=>{
                resolve({status: "err"})
            }).finally(() => client.close());
        });
    });
};

module.exports.deleteEntry = function (id, userId) {
    return new Promise(async (resolve, reject) => {
        getDbConnection().then(async (client) => {
            var db = client.db(dbname);
            var texts = db.collection('texts');
            var users = db.collection('users');
            var deletedText = await texts.findOne({_id: ObjectId(id)});
            users.updateOne({_id: ObjectId(userId)}, { $inc: { "actions": 1 }, $push: { "deleted": deletedText } })
                .then(()=>{
                    texts.remove({_id: ObjectId(id)}, true).then((status)=> resolve(status))
                }).finally(() => client.close());
        });
    });
};



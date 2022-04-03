var getDbConnection = require('../utils').getDbConnection;
var dbname = require('../utils').dbname;
let ObjectId = require('mongodb').ObjectId;

module.exports.searchTexts = function (config, text, pageSize, pageNumber) {
    return new Promise((resolve, reject) => {
        let text = config.filter;
        let pageSize = config.pageSize;
        let pageNumber = config.page;
        let versions = config.versions;
        let versionsStr = versions.map(v => v + "");

        getDbConnection().then((client) => {
            var db = client.db(dbname);
            var texts = db.collection('texts');
            texts.createIndex({
                "text": "text",
                "filename": "text",
                "source": "text"
            }).then(() => {

                var textQuery = texts.find({text: new RegExp(text, "i"), $or : [ {g: {$in: versions}}, {g: {$in: versionsStr}} ]})
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

module.exports.searchBySource = function (source, pageSize, pageNumber) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            let db = client.db(dbname);
            let texts = db.collection('texts');
            let textQuery = texts.find({source: source})
                .skip(pageSize * pageNumber)
                .limit(pageSize);

            let totalCount = textQuery.count();

            Promise.all([textQuery.toArray(), totalCount]).then(([records, count]) => {
                resolve({
                    records: records,
                    recordCountTotal: count
                });
            }).finally(() => client.close());
        });
    });
};

module.exports.searchById = function (id) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            let db = client.db(dbname);
            let texts = db.collection('texts');
            let query = texts.findOne({_id: ObjectId(id)}).then(data => resolve(data)).finally(() => client.close());
        });
    });
};

module.exports.searchByGFilename = function (g, filename) {
    return new Promise((resolve, reject) => {
        getDbConnection().then(client => {
            const db = client.db(dbname);
            const texts = db.collection('texts');
            console.log({filename, g})
            texts.findOne({filename, g}).then(data => resolve(data), err => reject(err)).finally(() => client.close());
        })
    })
}

module.exports.reportById = function (id, details) {
    return new Promise((resolve, reject) => {
        getDbConnection().then((client) => {
            let db = client.db(dbname);
            let texts = db.collection('texts');
            let update = texts.updateOne({_id: ObjectId(id)}, {$inc: {"reported": 1}, $push: {details: details}})
                .then(data => resolve(data))
                .finally(() => client.close());
            ;
        })
    })
};

module.exports.deleteDuplicates = function () {
    return new Promise((resolve, reject) => {
        getDbConnection().then(client => {
            const db = client.db(dbname)
            const texts = db.collection('texts');
            texts.aggregate([{
                $group: {
                    _id: {filename: "$filename", g: "$g"},
                    records: {$push: "$$ROOT"},
                    count: {$sum: 1}
                }
            }, {$match: {count: {$gt: 1}}}])
                .toArray()
                .then(async results => {
                    const toDelete = [];
                    results.forEach(result => {
                        toDelete.push(...result.records.slice(1).map(r => r._id))
                    })
                    const data = await texts.removeMany({"_id": { "$in": toDelete }})
                    resolve(data)
                }).finally(() => client.close())
        })
    })
}

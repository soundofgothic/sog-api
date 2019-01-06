var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectID;
var url = require('./config').mongoConnection;
var dbname = "sog-db";

getDbConnection=function(){
    return MongoClient.connect(url);
};

module.exports.searchTexts = function(text, pageSize, pageNumber) {
    return new Promise((resolve, reject)=>{
        getDbConnection().then((client)=>{
            var db = client.db(dbname);
            var texts = db.collection('texts');
            texts.createIndex({
                "text": "text",
                "filename": "text",
                "source": "text"
            }).then(()=>{

                var textQuery = texts.find( {text: new RegExp(text, "i") } )
                    .skip(pageSize * pageNumber)
                    .limit(pageSize);

                var totalCount = textQuery.count();

                Promise.all([textQuery.toArray(), totalCount]).then(([records, count])=>{
                    resolve({
                        records: records,
                        recordCountTotal: count
                    });
                });

            });
        });
    });
};

module.exports.searchBySource = function (source, pageSize, pageNumber) {
    return new Promise((resolve, reject)=>{
        getDbConnection().then((client)=>{
            let db = client.db(dbname);
            let texts = db.collection('texts');
            let textQuery = texts.find( { source: source} )
                .skip(pageSize * pageNumber)
                .limit(pageSize);

            let totalCount = textQuery.count();

            Promise.all([textQuery.toArray(), totalCount]).then(([records, count])=>{
                resolve({
                    records: records,
                    recordCountTotal: count
                });
            });
        });
    });
};

module.exports.searchById = function (id) {
    return new Promise((resolve, reject)=>{
        getDbConnection().then((client)=>{
            let db = client.db(dbname);
            let texts = db.collection('texts');
            let query = texts.findOne({_id : ObjectId(id)}).then(data=>resolve(data));
        });
    });
};
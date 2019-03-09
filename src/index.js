const express = require('express');
var cors = require('cors');
const app = express();
var db_utils = require('./db-utils');

app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
    var filter = req.query.filter || '';
    var page = parseInt(req.query.page) || 0;
    var pageSize = parseInt(req.query.pageSize) || 50;

    db_utils.searchTexts(filter, pageSize, page).then((texts) => {
        texts.defaultPageSize = pageSize;
        texts.pageNumber = page;
        texts.recordsOnPage = texts.records.length;
        res.json(texts);
    }).catch((e) => {
        console.log(e);
    });
});

app.get('/source', (req, res) => {
    var source = req.query.source || '';
    var page = parseInt(req.query.page) || 0;
    var pageSize = parseInt(req.query.pageSize) || 50;

    db_utils.searchBySource(source, pageSize, page).then((texts) => {
        texts.defaultPageSize = pageSize;
        texts.pageNumber = page;
        texts.recordsOnPage = texts.records.length;
        res.json(texts);
    }).catch((e) => {
        console.log(e);
    });
});

app.get('/id/:id', (req, res) => {
    let id = req.params.id;
    db_utils.searchById(id).then(text => res.json(text));
});

app.post('/report/:id', (req, res) => {
    let id = req.params.id;
    let details = req.body.details;
    //there will be captcha verification
    db_utils.reportById(id, details).then( status => res.json(status));
});

app.listen(3000, () => console.log('App listening on port 3000!'));

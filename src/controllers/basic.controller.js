var basicService = require('../services/basic.service');

module.exports = function (app) {
    app.get('/', (req, res) => {
        var filter = req.query.filter || '';
        var page = parseInt(req.query.page) || 0;
        var pageSize = parseInt(req.query.pageSize) || 50;

        basicService.searchTexts(filter, pageSize, page).then((texts) => {
            texts.defaultPageSize = pageSize;
            texts.pageNumber = page;
            texts.recordsOnPage = texts.records.length;
            res.json(texts);
        }).catch((e) => {
            console.log(e);
        });
    });

    app.get('/source', (req, res) => {
        var source = req.query.filter || '';
        var page = parseInt(req.query.page) || 0;
        var pageSize = parseInt(req.query.pageSize) || 50;

        basicService.searchBySource(source, pageSize, page).then((texts) => {
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
        basicService.searchById(id).then(text => res.json(text));
    });

    app.post('/report/:id', (req, res) => {
        let id = req.params.id;
        let details = req.body.details;
        //there will be captcha verification
        basicService.reportById(id, details).then( status => res.json(status));
    });
};

var basicService = require('../services/basic.service');

module.exports = function (app) {
    app.get('/', (req, res) => {

        let config = {
            filter: req.query.filter || '',
            page: parseInt(req.query.page) || 0,
            pageSize: parseInt(req.query.pageSize) || 50,
            versions: req.query.g ? req.query.g.split(", ").map(v => parseInt(v)) : [1, 2, 3]
        };

        basicService.searchTexts(config).then((texts) => {
            texts.defaultPageSize = config.pageSize;
            texts.pageNumber = config.page;
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

    app.get('/record/:g/:filename', (req, res) => {
        const g = req.params.g;
        const filename = req.params.filename;
        basicService.searchByGFilename(g, filename).then(text => res.json(text));
    });

    app.post('/report/:id', (req, res) => {
        let id = req.params.id;
        let details = req.body.details;
        //there will be captcha verification (XD)
        basicService.reportById(id, details).then(status => res.json(status));
    });
};

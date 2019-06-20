let SFXService = require('../services/sfx.service');

module.exports = function (app) {
    app.get('/sfx/', (req, res) => {
        let filter = req.query.filter || '';
        let page = parseInt(req.query.page) || 0;
        let pageSize = parseInt(req.query.pageSize) || 50;
        let tags = req.query.tags || [];
        let solved = req.query.solved ? req.query.solved === 'true' : null;

        SFXService.searchSFX(filter, tags, pageSize, page, solved).then((sfx) => {
            sfx.defaultPageSize = pageSize;
            sfx.pageNumber = page;
            sfx.recordsOnPage = sfx.records.length;
            res.json(sfx);
        }).catch((e) => {
            console.log(e);
        });
    });
};

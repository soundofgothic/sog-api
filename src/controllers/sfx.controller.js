let SFXService = require('../services/sfx.service');
let utils = require('../utils');

module.exports = function (app) {
    app.get('/sfx/', (req, res) => {
        let filter = req.query.filter || '';
        let page = parseInt(req.query.page) || 0;
        let pageSize = parseInt(req.query.pageSize) || 50;
        let tags = req.query.tags || "all";
        let solved = req.query.solved ? req.query.solved === 'true' : null;
        let sortField = req.query.sortField ? req.query.sortField : 'filename';
        let sortOrder = req.query.sortOrder ? parseInt(req.query.sortOrder) : 1;
        tags = tags.split(", ");

        SFXService.searchSFX(filter, tags, pageSize, page, solved, sortField, sortOrder).then((sfx) => {
            sfx.defaultPageSize = pageSize;
            sfx.pageNumber = page;
            sfx.recordsOnPage = sfx.records.length;
            res.json(sfx);
        }).catch((e) => {
            console.log(e);
        });
    });

    app.get('/sfx/tags', (req, res) => {
        SFXService.getSFXTags().then((tags) => res.json(tags));
    });

    app.post('/sfx/resolve', (req, res) => {
        let id = req.body.id;
        let tags = req.body.tags;
        let description = req.body.description;
        let user = utils.getUserFromToken(req);
        SFXService.resolveSFX(id, description, tags, user.id, true).then(() => res.status(200).json('success'))
    });

    app.post('/sfx/report', (req, res) => {
        let id = req.body.id;
        let tags = req.body.tags;
        let description = req.body.description;
        SFXService.reportSFX(id, description, tags, true).then(() => res.status(200).json('success'))
    })
};

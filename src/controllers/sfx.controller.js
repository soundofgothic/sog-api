let SFXService = require('../services/sfx.service');
let utils = require('../utils');
let expressJwt = require('express-jwt');

module.exports = function (app) {

    app.use(['/sfx/resolve'], expressJwt({
        secret: utils.getSecret,
        getToken: utils.getToken,
    }));

    app.get('/sfx/', (req, res) => {
        // let filter = req.query.filter || '';
        // let page = parseInt(req.query.page) || 0;
        // let pageSize = parseInt(req.query.pageSize) || 50;
        // let tags = req.query.tags ? req.query.tags.split(", ") : ["all"];
        // let solved = req.query.solved ? req.query.solved === 'true' : null;
        // let sortField = req.query.sortField ? req.query.sortField : 'not-set';
        // let sortOrder = req.query.sortOrder ? parseInt(req.query.sortOrder) : -1;
        // let versions = req.query.vs ? req.query.vs.split(", ").map(v => parseInt(v)) : [1, 2, 3];

        let config = {
            filter: req.query.filter || '',
            page: parseInt(req.query.page) || 0,
            pageSize: parseInt(req.query.pageSize) || 50,
            tags: req.query.tags ? req.query.tags.split(", ") : ["all"],
            solved: req.query.solved ? req.query.solved === 'true' : null,
            sortField: req.query.sortField ? req.query.sortField : 'not-set',
            sortOrder: req.query.sortOrder ? parseInt(req.query.sortOrder) : -1,
            versions: req.query.g ? req.query.g.split(", ").map(v => parseInt(v)) : [1, 2, 3]
        };


        SFXService.searchSFX(config).then((sfx) => {
            sfx.defaultPageSize = config.pageSize;
            sfx.pageNumber = config.page;
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

let reportService = require('../services/report.service');
let utils = require('../utils');
let expressJwt = require('express-jwt');

module.exports = function (app) {

    app.use(['/reports/*', '/reports'], expressJwt({
        secret: utils.getSecret,
        getToken: utils.getToken,
    }));

    app.get('/reports', (req, res) => {
        let config = {
            filter: req.query.filter || '',
            page: parseInt(req.query.page) || 0,
            pageSize: parseInt(req.query.pageSize) || 50,
            versions: req.query.g ? req.query.g.split(", ").map(v => parseInt(v)) : [1, 2, 3]
        };

        reportService.searchReports(config).then((texts) => {
            texts.defaultPageSize = config.pageSize;
            texts.pageNumber = config.page;
            texts.recordsOnPage = texts.records.length;
            res.json(texts);
        }).catch((e) => {
            console.log(e);
        });
    });

    app.post('/reports/resolve', (req, res) =>{
       let id = req.body.id;
       let text = req.body.text;
       let user = utils.getUserFromToken(req);
       reportService.resolveReport(id, text, user.id).then((status)=>{
           res.json(status);
       })
    });

    app.post('/reports/cancel', (req, res) =>{
        let id = req.body.id;
        let user = utils.getUserFromToken(req);
        reportService.deleteReport(id, user.id).then((status)=>{
            res.json(status);
        })
    });

    app.post('/reports/delete', (req, res) =>{
        let id = req.body.id;
        let user = utils.getUserFromToken(req);
        reportService.deleteEntry(id, user.id).then((status)=>{
            res.json(status);
        })
    });

};

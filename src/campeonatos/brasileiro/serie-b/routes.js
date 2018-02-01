const BrasileiroSerieB = require('./index');
const baseRoute = '/v1/campeonatos/brasileiro/serie-b';

module.exports = (app) => {

    app.get(baseRoute + '/:edicao/jogos', (req, res) => {
        const obj = new BrasileiroSerieB(req.params.edicao);
        obj.getJogos(req.query.time).then((results) => {
            res.status(200).send(results);
        }).catch((error) => {
            res.error(error);
        });
    });

    app.get(baseRoute + '/:edicao/calendario', (req, res) => {
        const obj = new BrasileiroSerieB(req.params.edicao);
        obj.getCalendario(req.query.time).then((results) => {
            res.header("Content-Type", "text/calendar");            
            res.status(200).send(results);
        }).catch((error) => {
            res.error(error);
        });
    });

    app.get(baseRoute + '/:edicao/classificacao', (req, res) => {
        const obj = new BrasileiroSerieB(req.params.edicao);
        obj.getClassificacao().then((results) => {
            res.status(200).send(results);
        }).catch((error) => {
            res.error(error);
        });
    });

    app.get(baseRoute + '/:edicao/times', (req, res) => {
        const obj = new BrasileiroSerieB(req.params.edicao);
        obj.getTimes().then((results) => {
            res.status(200).send(results);
        }).catch((error) => {
            res.error(error);
        });
    });

    app.get(baseRoute + '/:edicao/artilharia', (req, res) => {
        const obj = new BrasileiroSerieB(req.params.edicao);
        obj.getArtilharia(req.query.time).then((results) => {
            res.status(200).send(results);
        }).catch((error) => {
            res.error(error);
        });
    });
}


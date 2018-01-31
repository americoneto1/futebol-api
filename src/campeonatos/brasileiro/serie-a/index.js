const Brasileiro = require('./../index');

class BrasileiroSerieA extends Brasileiro {
    constructor(edicao) {
        super('a', edicao);
    }
}

module.exports = BrasileiroSerieA

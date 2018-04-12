const express = require('express');
const app = express();

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
process.env.PORT = process.env.PORT || 9000;
process.env.REDIS_ENABLE = process.env.REDIS_ENABLE || true;

if (process.env.REDIS_ENABLE === true) {
    const cache = require('express-redis-cache')(require('./config/redis'));
    app.use(cache.route());
}

require('./campeonatos/brasileiro/serie-a/routes')(app);
require('./campeonatos/brasileiro/serie-b/routes')(app);

app.listen(process.env.PORT, function () {
    console.log('Express server listening on %s, in %s mode', process.env.PORT, app.get('env'));
});

exports = module.exports = app;
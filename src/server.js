const express = require('express');
const app = express();

process.env.NODE_ENV = process.env.NODE_ENV || 'dev';
process.env.PORT = process.env.PORT || 9000;

require('./campeonatos/brasileiro/serie-a/routes')(app);

app.listen(process.env.PORT, function () {
    console.log('Express server listening on %s, in %s mode', process.env.PORT, app.get('env'));
});

exports = module.exports = app;
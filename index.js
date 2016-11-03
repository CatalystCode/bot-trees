var path = require('path');
var express = require('express');
var port = process.env.PORT || 3978;

var app = express();
var botConnector = require('./bot');

app.post('/api/messages', botConnector.listen());

app.listen(port, function () {
  console.log('listening on port %s', port);
});


var path = require('path');
var express = require('express');
var builder = require('botbuilder');
var app = express();
var BotGraphDialog = require('bot-graph-dialog');

var config = require('./config');

var connector = new builder.ChatConnector(config.bot);
var bot = new builder.UniversalBot(connector);

var port = process.env.PORT || 3978;

var intents = new builder.IntentDialog();     

bot.dialog('/', intents);

intents.matches(/^(help|hi|hello)/i, [
  function (session) {
    session.send('Hi, how can I help you?');
  }
]);

// ============================================

var scenariosPath = path.join(__dirname, 'scenarios');
var handlersPath = path.join(__dirname, 'handlers');

var routerGraph = require('./scenarios/router.json');
var routerGraphDialog = new BotGraphDialog({tree: routerGraph, scenariosPath, handlersPath});
intents.onDefault(routerGraphDialog.getSteps());

// ============================================


app.post('/api/messages', connector.listen());

app.listen(port, function () {
  console.log('listening on port %s', port);
});


var express = require('express');
var builder = require('botbuilder');
var app = express();

var connector = new builder.ChatConnector({
    appId: process.env.MICROSOFT_APP_ID,
    appPassword: process.env.MICROSOFT_APP_PASSWORD
});
var bot = new builder.UniversalBot(connector);

var port = process.env.PORT || 3978;

var intents = new builder.IntentDialog();
intents.onDefault([
    function (session, results) {
        session.send('Hi, what\'s your question?');
    }
]);       

bot.dialog('/', intents);

app.post('/api/messages', connector.listen());

app.listen(port, function () {
  console.log('listening on port %s', port);
});


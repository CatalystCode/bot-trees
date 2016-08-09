var express = require('express');
var builder = require('botbuilder');
var app = express();

var config = require('./config');

var connector = new builder.ChatConnector(config.bot);
var bot = new builder.UniversalBot(connector);

var port = process.env.PORT || 3978;

var intents = new builder.IntentDialog();
intents.onDefault([
    function (session, results) {
        session.send('Hi, what\'s your question?');
    }
]);       

bot.dialog('/', intents);


intents.matches(/^(help|hi|hello)/i, [
    function (session) {
        session.send('hello! help message etc... :-)');
    }
]);

intents.matches(/^scenario1/i, [
    function (session) {
       builder.Prompts.confirm(session, 'confirm?', { listStyle: builder.ListStyle.button });
    },
    function (session, result) {
        var answer = result.response;
        if (answer) {
          session.send('you said yes!');
        } else {
          session.send('you said no... :/');
        }

        session.endDialog();
    }
]);



// ============================================

var tree = require('./sample.scenario.json');
var BotTree = require('./BotTree');

var botTree = new BotTree({tree, steps: 10});
intents.matches(/^scenario2/i, botTree.getSteps());

// ============================================


app.post('/api/messages', connector.listen());

app.listen(port, function () {
  console.log('listening on port %s', port);
});


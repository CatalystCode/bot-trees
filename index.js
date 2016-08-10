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
intents.onDefault([
    function (session, results) {
        session.send('Hi, what\'s your question?');
    }
]);       

bot.dialog('/', intents);

intents.matches(/^(help|hi|hello)/i, [
  function (session) {
    session.send('welcome message...');
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

var scenariosPath = path.join(__dirname, 'scenarios');
var handlersPath = path.join(__dirname, 'handlers');

var workoutGraph = require('./scenarios/workout.json');
var workoutGraphDialog = new BotGraphDialog({tree: workoutGraph, scenariosPath, handlersPath});
intents.matches(/^workout/i, workoutGraphDialog.getSteps());

var botsGraph = require('./scenarios/bots.json');
var botsGraphDialog = new BotGraphDialog({tree: botsGraph, scenariosPath, handlersPath});
intents.matches(/^bots/i, botsGraphDialog.getSteps());

// ============================================


app.post('/api/messages', connector.listen());

app.listen(port, function () {
  console.log('listening on port %s', port);
});


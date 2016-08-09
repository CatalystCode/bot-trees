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


var histeps = [];
var tree = null;
var dialogHandler = require('./dialogHandler');

intents.matches(/^(help|hi|hello)/i, [
  function performAction(session) {

    dialogHandler.performAcion(session, tree, builder);

    session.next();
  },
  function collectData(session, results) {

    var currentNode = getCurrentStep(session, tree);
    dialogHandler.collectResponse(session, tree, builder, results);
    
    session.next();
  },
  function nextStep(session) {
    // choose next step...
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

var botTree = new BotTree({tree});

function stepHandler(session, args, a, b) {
  console.log('stepHandler: ');
  
}
var steps = [];
for (var i=0; i<100; i++) steps.push(stepHandler);

//var flatTree = normalizeTree(tree);

intents.matches(/^scenario2/i, steps);

// ============================================


app.post('/api/messages', connector.listen());

app.listen(port, function () {
  console.log('listening on port %s', port);
});


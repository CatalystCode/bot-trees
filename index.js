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

var tree = require('./sampleTree.json');

function normalizeTree(tree) {
  var flat = {};
  recursive(tree);
  return flat;

  function recursive(node) {
    if (node.next && node.next.length > 0)
      node.next.forEach(function(nextNodeItem, index) {
        recursive(nextNodeItem);
        console.log('deleting node id', nextNodeItem.id);
        node.next[index] = {
          id: nextNodeItem.id,
          condition: nextNodeItem.condition
        };
      }, this); 
    console.log('adding node id', node.id);
    //delete node.next;
    flat[node.id] = node;
  }
}

function stepHandler(session, args, a, b) {
  console.log('stepHandler: ');
  
}
var steps = [];
for (var i=0; i<100; i++) steps.push(stepHandler);

var flatTree = normalizeTree(tree);

intents.matches(/^scenario2/i, steps);

// ============================================


app.post('/api/messages', connector.listen());

app.listen(port, function () {
  console.log('listening on port %s', port);
});


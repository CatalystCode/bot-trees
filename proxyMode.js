var path = require('path');
var util = require('util');
var express = require('express');
var builder = require('botbuilder');
var GraphDialog = require('bot-graph-dialog');
var config = require('./config');
var fs = require('fs');

var port = process.env.PORT || 3978;
var app = express();

var microsoft_app_id = config.get('MICROSOFT_APP_ID');
var microsoft_app_password = config.get('MICROSOFT_APP_PASSWORD');

var connector = new builder.ChatConnector({
    appId: microsoft_app_id,
    appPassword: microsoft_app_password,
  });
  
var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();     

var scenariosPath = path.join(__dirname, 'bot', 'scenarios');
var handlersPath = path.join(__dirname, 'bot', 'handlers');


class ProxyNavigator {

  constructor() {

    this.nodes = [
      {
        "type": "prompt",
        "data": { "type": "number", "text": "How old are you?" }
      },
      {
        "type": "prompt",
        "data": { "type": "number", "text": "what's your height?" }
      },
      {
        "type": "sequence",
        "steps": [
          {
            "type": "text",
            "data": { "text": "message 1..." }
          },
          {
            "type": "text",
            "data": { "text": "message 2..." }
          },
          {
            "type": "text",
            "data": { "text": "message 3..." }
          },
          {
            "type": "prompt",
            "data": { "type": "time", "text": "When did it start?" }
          }
        ]
      }
    ];
  }

  // returns the current node of the dialog
  async getCurrentNode(session) {
    console.log(`getCurrentNode, message: ${JSON.stringify(session.message, true, 2)}`);
    
    var index = session.privateConversationData._currIndex || 0;
    var internalIndex = session.privateConversationData._currInternalIndex;
    var node = this.nodes[index];

    if (!isNaN(internalIndex)) {
      node = node.steps[internalIndex];
    }

    return node;
  };

  // resolves the next node in the dialog
  async getNextNode(session) {
    console.log(`getNextNode, message: ${util.inspect(session.message)}`);
    //console.log(`result from previous call: ${session.dialogData.data[varname]}`);
    
    var index = session.privateConversationData._currIndex || 0;
    var node = this.nodes[index];
    var internalIndex = session.privateConversationData._currInternalIndex;
    if (isNaN(internalIndex) || (node.steps && internalIndex + 1 > node.steps.length - 1)) {
      internalIndex = undefined;
      index++;
    }

    if (index > this.nodes.length -1) {
      index = 0;
    }

    node = this.nodes[index];
    session.privateConversationData._currIndex = index;

    if (node.steps) {
      if (isNaN(internalIndex))
        internalIndex = 0;
      else
        internalIndex++;

      if (internalIndex > node.steps.length - 1) {
        internalIndex = 0;
      }
      session.privateConversationData._currInternalIndex = internalIndex;
      node = node.steps[internalIndex];
    }
    else {
      delete session.privateConversationData._currInternalIndex;
    }

    return node;
  };
}

process.nextTick(async () => {
  var navigator = new ProxyNavigator();
  var graphDialog = await GraphDialog.create({ bot, navigator });
  bot.dialog('/', graphDialog.getDialog());
  console.log(`proxy graph dialog loaded successfully`);
});


app.post('/api/messages', connector.listen());

app.listen(port, () => {
  console.log('listening on port %s', port);
});

var path = require('path');
var util = require('util');
var express = require('express');
var builder = require('botbuilder');
var GraphDialog = require('bot-graph-dialog');
var request = require('request-promise');
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

// an implementation of the Navigator interface
// which will act as the proxy for the backend API
class ProxyNavigator {

  constructor() {
    // backend root URL
    this.apiUrl = "http://86d54bb8.ngrok.io/api/msBotFramework";
  }

  // returns the current node of the dialog
  async getCurrentNode(session) {
    console.log(`getCurrentNode, message: ${JSON.stringify(session.message, true, 2)}`);

    var node;
    if (session.privateConversationData._currentNode) {
      try {
        node = JSON.parse(session.privateConversationData._currentNode);
      }
      catch(err) {
        console.error(`error parsing current node json: ${session.privateConversationData._currentNode}`);
      }
    }

    if (!node) {
      node = await this.getNextNode(session);
    }

    // in case of a node with a few steps (internal nodes)
    var internalIndex = session.privateConversationData._currInternalIndex;
    if (node && node.steps && !isNaN(internalIndex)) {
      node = node.steps[internalIndex];
    }

    return node;
  };

  // resolves the next node in the dialog
  async getNextNode(session) {
    console.log(`getNextNode, message: ${JSON.stringify(session.message, true, 2)}`);

    var node;
    if (session.privateConversationData._currentNode) {
      try {
        node = JSON.parse(session.privateConversationData._currentNode);
      }
      catch(err) {
        console.error(`error parsing current node json: ${session.privateConversationData._currentNode}`);
      }
    }

    if (node && node.steps) {
      var internalIndex = session.privateConversationData._currInternalIndex;
      internalIndex = isNaN(internalIndex) ? 0 : internalIndex + 1;
      if (internalIndex > node.steps.length - 1) {
        // get next node from remote api
        return await this.resolveNextRemoteNode(session);
      }

      session.privateConversationData._currInternalIndex = internalIndex;
      return node.steps[internalIndex];
    }

    return await this.resolveNextRemoteNode(session);
  };

  async resolveNextRemoteNode(session) {
    var body = { 
      message: session.message
    };

    // add the resolved value from the bot-graph-dialog.
    // in case of a 'time' prompt- "2 days ago" will be resolved to the
    // actual date 2 days ago
    if (session.privateConversationData._lastResolvedResult) {
      body.resolved = session.privateConversationData._lastResolvedResult;
    }

    var node = await this.callApi({
      uri: this.apiUrl + '/message',
      body,
      method: 'POST',
      json: true
    });

    delete session.privateConversationData._currInternalIndex;

    if (!node.steps) {
      node = {
        type: 'sequence',
        steps: [ node ]
      }
    }

    node.steps[node.steps.length - 1].stop = true;

    session.privateConversationData._currInternalIndex = 0;
    session.privateConversationData._currentNode = node ? JSON.stringify(node) : null;

    node = node.steps[0];
    return node;
  }

  // calls the remote API
  async callApi(opts) {
    console.log(`invoking http call: ${util.inspect(opts)}`);

    try {
      var result = await request(opts);
    }
    catch(err) {
      console.error(`error invoking request: ${err.message}, opts: ${opts}`);
      return;
    }

    console.log(`got result: ${util.inspect(result)}`);
    return result.response;
  }
}

process.nextTick(async () => {
  var navigator = new ProxyNavigator();
  var graphDialog = await GraphDialog.create({ bot, navigator, proxyMode: true });
  bot.dialog('/', graphDialog.getDialog());
  console.log(`proxy graph dialog loaded successfully`);
});

app.post('/api/messages', connector.listen());

app.listen(port, () => {
  console.log('listening on port %s', port);
});

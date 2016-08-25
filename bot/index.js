var path = require('path');
var builder = require('botbuilder');
var BotGraphDialog = require('bot-graph-dialog');
var config = require('../config');

var microsoft_app_id = config.get('MICROSOFT_APP_ID');
var microsoft_app_password = config.get('MICROSOFT_APP_PASSWORD');

var connector = new builder.ChatConnector({
    appId: microsoft_app_id,
    appPassword: microsoft_app_password,
  });
  
var bot = new builder.UniversalBot(connector);
var intents = new builder.IntentDialog();     

module.exports = connector;

bot.dialog('/', intents);

intents.matches(/^(help|hi|hello|hey)/i, [
  function (session) {
    session.send('Hi, I am your customer service bot! How are you today?');
  }
]);

// ============================================

var scenariosPath = path.join(__dirname, 'scenarios');
var handlersPath = path.join(__dirname, 'handlers');

var routerGraph = require('./scenarios/amdocs-ari.json');
var routerGraphDialog = new BotGraphDialog({tree: routerGraph, scenariosPath, handlersPath});
intents.onDefault(routerGraphDialog.getSteps());

// ============================================


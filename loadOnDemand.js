var path = require('path');
var express = require('express');
var builder = require('botbuilder');
var BotGraphDialog = require('bot-graph-dialog');
var config = require('./config');
var fs = require('fs');

var GraphDialog = BotGraphDialog.GraphDialog;
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
var dialogsMapById = {};
var dialogsMapByPath = {};

bot.dialog('/', intents);

intents.matches(/^(help|hi|hello)/i, [
  function (session) {
    session.send('Hi, how can I help you?');
  }
]);

// dynamically load dialog from a remote datasource 
// create a GraphDialog instance and bind it on the bot 
function loadDialog(dialog) {
  return new Promise((resolve, reject) => {
    console.log(`loading scenario: ${dialog.scenario} for regex: ${dialog.regex}`);
        
    var re = new RegExp(dialog.regex, 'i');

    intents.matches(re, [
      function (session) {
        session.beginDialog(dialog.path);
      }
    ]);

    GraphDialog
      .fromScenario({ 
        bot,
        scenario: dialog.scenario, 
        loadScenario, 
        loadHandler,
        customTypeHandlers: getCustomTypeHandlers(),
        onBeforeProcessingStep
      })
      .then(graphDialog => {
        
        dialog.graphDialog = graphDialog;
        dialogsMapById[graphDialog.getDialogId()] = dialog;
        dialogsMapByPath[dialog.path] = dialog;

        bot.dialog(dialog.path, graphDialog.getDialog());
        console.log(`graph dialog loaded successfully: scenario ${dialog.scenario} version ${graphDialog.getDialogVersion()} for regExp: ${dialog.regex} on path ${dialog.path}`);
        return resolve();
      })
      .catch(err => {
        console.error(`error loading dialog: ${err.message}`);
        return reject(err);
      });
  });
}

// trigger dynamica load of the dialogs
loadDialogs()
  .then(dialogs => dialogs.forEach(dialog => loadDialog(dialog)))
  .catch(err => console.error(`error loading dialogs dynamically: ${err.message}`));


// intercept change in scenario version before processing each dialog step
// if there was a change in the version, restart the dialog
// TODO: think about adding this internally to the GraphDialog so users gets this as default behaviour.
function onBeforeProcessingStep(session, args, next) {

  session.sendTyping();
  var dialogVersion = this.getDialogVersion();

  if (!session.privateConversationData._dialogVersion) {
    session.privateConversationData._dialogVersion = dialogVersion;
  }

  if (session.privateConversationData._dialogVersion !== dialogVersion) {
    session.send("Dialog updated. We'll have to start over.");
    return this.restartDialog(session);
  }

  return next();
}


// this allows you to extend the json with more custom node types, 
// by providing your implementation to processing each custom type.
// in the end of your implemention you should call the next callbacks
// to allow the framework to continue with the dialog.
// refer to the customTypeStepDemo node in the stomachPain.json scenario for an example.
function getCustomTypeHandlers() {
  return [
    {
      name: 'myCustomType',
      execute: (session, next, data) => {
        console.log(`in custom node type handler: customTypeStepDemo, data: ${data.someData}`);
        return next();
      }
    }
  ];
}

// this is the handler for loading scenarios from external datasource
// in this implementation we're just reading it from a file
// but it can come from any external datasource like a file, db, etc.
function loadScenario(scenario) {
  return new Promise((resolve, reject) => {
    console.log('loading scenario', scenario);
    // implement loadScenario from external datasource.
    // in this example we're loading from local file
    var scenarioPath = path.join(scenariosPath, scenario + '.json');
    
    return fs.readFile(scenarioPath, 'utf8', (err, content) => {
      if (err) {
        console.error("error loading json: " + scenarioPath);
        return reject(err);
      }

      var scenarioObj = JSON.parse(content);

      // simulating long load period
      setTimeout(() => {
        console.log('resolving scenario', scenarioPath);
        resolve(scenarioObj);
      }, Math.random() * 3000);
    });  
  });
}

// this is the handler for loading handlers from external datasource
// in this implementation we're just reading it from a file
// but it can come from any external datasource like a file, db, etc.
//
// NOTE:  handlers can also be embeded in the scenario json. See scenarios/botGames.json for an example.
function loadHandler(handler) {
  return new Promise((resolve, reject) => {
    console.log('loading handler', handler);
    // implement loadHandler from external datasource.
    // in this example we're loading from local file
    var handlerPath = path.join(handlersPath, handler);
    var handlerString = null;
    return fs.readFile(handlerPath, 'utf8', (err, content) => {
      if (err) {
        console.error("error loading handler: " + handlerPath);
        return reject(err);
      }
      // simulating long load period
      setTimeout(() => {
        console.log('resolving handler', handler);
        resolve(content);
      }, Math.random() * 3000);
    });  
  });
}

// this is the handler for loading scenarios from external datasource
// in this implementation we're just reading it from the file scnearios/dialogs.json
// but it can come from any external datasource like a file, db, etc.
function loadDialogs() {
  return new Promise((resolve, reject) => {
    console.log('loading dialogs');

    var dialogsPath = path.join(scenariosPath, "dialogs.json");
    return fs.readFile(dialogsPath, 'utf8', (err, content) => {
      if (err) {
        console.error("error loading json: " + dialogsPath);
        return reject(err);
      }

      var dialogs = JSON.parse(content);

      // simulating long load period
      setTimeout(() => {
        console.log('resolving dialogs', dialogsPath);
        resolve(dialogs.dialogs);
      }, Math.random() * 3000);
    });  
  });
}

app.post('/api/messages', connector.listen());

// endpoint for reloading scenario on demand
app.get('/api/load/:scenario', (req, res) => {
  var scenario = req.params.scenario;
  console.log(`reloading scenario: ${scenario}`);
  var dialog = dialogsMapById[scenario];
  
  return dialog.graphDialog.reload().then(()=>{
    var msg = `scenario id '${scenario}' reloaded`;
    console.log(msg);
    return res.end(msg);
  })
  .catch(err => res.end(`error loading dialog: ${err.message}`));

});

app.listen(port, function () {
  console.log('listening on port %s', port);
});


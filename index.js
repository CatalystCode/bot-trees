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

bot.dialog('/', intents);

intents.matches(/^(help|hi|hello)/i, [
  session => {
    session.send('Hi, how can I help you?');
  }
]);

// dynamically load dialogs from external datasource
// create a GraphDialog for each and bind it to the intents object
process.nextTick(async () => {

  var dialogs = await loadDialogs();

  dialogs.forEach(async dialog => {
    console.log(`loading scenario: ${dialog.scenario} for regex: ${dialog.regex}`);
    
    var re = new RegExp(dialog.regex, 'i');
    intents.matches(re, [
      function (session) {
        session.beginDialog(dialog.path, {});
      }
    ]);

    try {
      var graphDialog = await GraphDialog.fromScenario({ 
        bot,
        scenario: dialog.scenario, 
        loadScenario, 
        loadHandler,
        customTypeHandlers: getCustomTypeHandlers()
      });
    }
    catch(err) {
      console.error(`error loading dialog: ${err.message}`);
    }
      
    bot.dialog(dialog.path, graphDialog.getDialog());
    
    console.log(`graph dialog loaded successfully: scenario ${dialog.scenario} for regExp: ${dialog.regex}`);

  });
});


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

app.listen(port, () => {
  console.log('listening on port %s', port);
});

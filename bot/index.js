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

intents.matches(/^(help|hi|hello)/i, [
  function (session) {
    session.send('Hi, how can I help you?');
  }
]);

// ============================================

var scenariosPath = path.join(__dirname, 'scenarios');
var handlersPath = path.join(__dirname, 'handlers');


//var routerGraph = require('./scenarios/router.json');
//var routerGraphDialog = new BotGraphDialog.GraphDialog( {parser: {scenario: 'router', scenariosPath, handlersPath}});
var routerGraphDialog = new BotGraphDialog.GraphDialog( { parser: {scenario: 'router', loadJson: loadJson, handlersPath } } );
routerGraphDialog.init().then(() => {
  intents.onDefault(routerGraphDialog.getSteps());
  console.log('graph dialog loaded successfully');
});

function loadJson(scenario) {
  return new Promise(function(resolve, reject) {
    console.log('loading scenario', scenario);
    // implement loadJson from external datasource.
    // in this example we're loading from local file
    var scenarioPath = path.join(scenariosPath, scenario);
    var scenarioObj = null;
    try {
        scenarioObj = require(scenarioPath);
    }
    catch (err) {
        console.error("error loading json: " + scenarioPath);
        throw err;
    }

    setTimeout(function() {
      console.log('resolving scenario', scenario);
      resolve(scenarioObj);
    }, Math.random() * 3000);
  });
}


/*
var b = new BotGraphDialog.Builder();

var nav = b
  .text().text('hi! welcome to the graph dialog scenario!').end()
  .prompt('smokingId').text('are you smoking?').varname('smoking')
    .condition().if('smoking == "yes').steps(b
      .text().text('i\'m going to ask you a few questions regarding you smoking...').end()
      .prompt().text('for how many years?').varname('yearsSmoking').end()
      .prompt().text('how many cigaretts a day?').varname('numPerDay').end()
    ).end() /* condition */
/*    .condition().if('smoking == "no"').steps(b
      .prompt().text('are you sure?').varname('smokingSure')
        .condition().if('smokingSure == "no').jump('smokingId').end()
    ).end() /* condition */ /*.end() /* prompt */
/*  .prompt().text('do you have fever?').varname('fever').end()    
  .navigator();

// currently intents.onDefault gets IDialogWaterfallStep[],
// long term I hope to be able to add INavigator to the options of possible types to send to the onDefault() API
// or any other API that gets  IDialogWaterfallStep[], and that internally the bot fw will call navigator.getNext(): IDialogWaterfallStep
// to get the next step: intents.onDefault(<INavigator>nav);
intents.onDefault(nav.getSteps());
*/







//var routerGraphDialog = new BotGraphDialog.GraphDialog( {parser: {scenario: 'router', scenariosPath, handlersPath}});
//intents.onDefault(routerGraphDialog.getSteps());

//.textNode('id1', {text: 'hey! what do you think?', varname: 'q3'}).end()


// ============================================


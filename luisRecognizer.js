
var _ = require('underscore');
var request = require('request-promise');
var Promise = require('promise');

// Retreive the first intent from a LUIS api
function scoreIntent(model, text, minScore) {

  minScore = minScore || 0;
  return new Promise(function (resolve, reject) {
    request(model.url + encodeURIComponent(text))
      .then(function (result) {
        var json = JSON.parse(result);

        if (!json || !json.intents || !json.intents.length) return resolve(null);

        // In case when minumum score is required, enforce minimum score
        if (json.intents[0].score < minScore) return resolve(null);

        var intent = json.intents[0];
        intent.model = model.name;
        return resolve(intent);
      })
      .catch(reject);
  });
}

function collectIntents(models, text, minScore) {

  return new Promise(function (resolve, reject) {

    var promises = [];
    var intents = [];
    minScore = minScore || 0;
    models.forEach(function (model) {
      promises.push(scoreIntent(model, text, minScore));
    });

    Promise.all(promises)
      .then(function (intents) {
        var sortedIntents = _.sortBy(_.compact(intents), 'score').reverse();
        resolve(sortedIntents);
      })
      .catch(reject);
  });  
}

var models = [
  {
    name: 'bot-common-responses',
    url: 'https://api.projectoxford.ai/luis/v1/application?id=7ff935f4-fe33-4a2a-b155-b82dbbf456ed&subscription-key=d7b46a6c72bf46c1b67f2c4f21acf960&q='
  },
  {
    name: 'Bottle',
    url: 'https://api.projectoxford.ai/luis/v1/application?id=0a2cc164-5a19-47b7-b85e-41914d9037ba&subscription-key=d7b46a6c72bf46c1b67f2c4f21acf960&q='
  }
];

collectIntents(models, 'help').done(function (intent) {
  var a = intent;
});
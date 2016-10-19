


process.on('uncaughtException', function (er) {
  console.error('uncaughtException', er.stack)
  setTimeout(() => {
    process.exit(1);
  }, 3000);
});

var path = require('path');
var express = require('express');
var port = process.env.PORT || 3978;
var log = require('./log');

if (log.config.enabled) {
  log.init({
    domain: process.env.COMPUTERNAME || '',
    instanceId: log.getInstanceId(),
    app: 'bot',
    level: log.config.level,
    transporters: log.config.transporters
  }, function(err) {
    if (err) {
      return console.error(err);
    }
    console.log('starting bot...');
    startBot();
  });
} else {
  startBot();
}


function startBot() {
  
  var app = express();
  
  var bot = require('./bot');
  app.post('/api/messages', bot.connector.listen());

  app.get('/dialog/reload', (req, res) => {
    bot.reload()
      .then(() => res.end('reloaded successfully'))
      .catch(err => res.end('error loading: ${err.message}'));
  });

  app.listen(port, function () {
    console.log('listening on port %s', port);
  });
}

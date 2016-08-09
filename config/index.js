/*
 * Please refer to the dev.sample.json file.
 * Copy this file and create a new file named "dev.private.json".
 * Fill in the details for the features you'de like to support.
 * You don't have to fill in all settings, but leave those you're not using blank.
*/

var nconf = require('nconf');
var path = require('path');

var dev = path.join(__dirname, 'dev.private.json')
var nconfig = nconf.env().file({ file: dev });


// This is the main configuration file which helps you turn on and off some of the features
// supported in this example.
// To turn on any feature, please provide the relevant configuration details below.
// Not providing the neccessary configuration details will result in a feature being disabled.

// Authentication
// --------------
// nesseceary to connect to bot framework

var microsoft_app_id = nconfig.get('MICROSOFT_APP_ID');
var microsoft_app_password = nconfig.get('MICROSOFT_APP_PASSWORD');

var config = {
  bot: {
    appId: microsoft_app_id,
    appPassword: microsoft_app_password,
  }
}

module.exports = config;
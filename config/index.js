/*
 * Please refer to the dev.sample.json file.
 * Copy this file and create a new file named "dev.private.json".
 * Fill in the details for the features you'de like to support.
 * You don't have to fill in all settings, but leave those you're not using blank.
*/

var nconf = require('nconf');
var path = require('path');

var config = nconf.env().file({ file: path.join(__dirname, 'dev.private.json') });

module.exports = config;
# Bot Trees
This is a sample bot app that uses the [bot-graph-dialog](https://github.com/CatalystCode/bot-graph-dialog) extension for dynamically loading graph-based dialogs.
Use this app as a reference for using the `bot-graph-dialog` extension.

**Read more about the motivation for developing this extension [here](https://www.microsoft.com/developerblog/real-life-code/2016/11/11/Bot-Graph-Dialog.html)**


## Getting Started

**Note**- This page assumes you're already familar with the [core concepts](https://docs.botframework.com/en-us/node/builder/guides/core-concepts/#navtitle) of bots and how to run them locally on your machine. 
You'll need to have a bot provisioned in the developer portal. Follow [these instructions](https://docs.botframework.com/en-us/csharp/builder/sdkreference/gettingstarted.html) (look for the _Registering your Bot with the Microsoft Bot Framework_ section) to register your bot with the Microsoft Bot Framework.

```
git clone https://github.com/CatalystCode/bot-trees.git
cd bot-trees
npm install
```

Create a `config/dev.private.json` base on the `config/dev.sample.json` file. Edit it and add your bot App id and password.

After connecting your bot to this endpoint, run `npm start`.



## Samples
There are a few sample files in the root of this project:

## index.js
This is the default sample which loads the different dialogs from the `bot/scenarios/dialogs.json` file.
It adds each of the scenarios on the bot and binds it to the relevant RegEx as defined in the scenario.

## loadOnDemand.js
This file demonstrates how to reload scenarios on-demand in cases that a scenario was modified on the backend.
In this scenario, if a user was in the middle of a dialog that was updated, he would get a message saying the dialog was changed and that he will need to restart the dialog.

To test this scenario, after starting a dialog such as the `stomachPain` by sending `stomach` to the bot:

1. Answer the first question the bot asks.
2. Change the version of the stomach pain scenario in the `bot/scenarios/stomachPain.json` file, and maybe the text of the first question, then save the file.
3. Browse the following URL `http://localhost:3978/api/load/stomachPain` to reload the scenario.
4. Continue the conversation with the bot. You should get a message that the dialog was updated and that you need to start over. You should see the updated question now.

**Comment** If the `version` field in the root of the dialog object is specified, this will be considered as the scenario version. If the version was not specified, the bot will assign a version by hashing the content of the json file.

## router.js
This file demonstrates how to use [LUIS](https://www.luis.ai/) in order to extract a user intent, and then branch to the next scenario based on the result that was received from LUIS. 

# License
[MIT](LICENSE)


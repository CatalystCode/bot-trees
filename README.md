# Bot Trees
This is a sample bot app that uses the [bot-graph-dialog](https://github.com/CatalystCode/bot-graph-dialog) extension for dynamically loading graph-based dialogs.
Use this app as a reference for using the `bot-graph-dialog` extension.

**Read more about the motivation for developing this extension [here](http://TODO-ADD-CASE-STUDY-LINK-WHEN-PUBLISHED)**


Getting Started
================

**Note**- This page assumes you're already familar with the [core concepts](https://docs.botframework.com/en-us/node/builder/guides/core-concepts/#navtitle) of bots and how to run them locally on your machine. 
You'll need to have a bot provisioned in the developer portal. Follow [these instructions](https://docs.botframework.com/en-us/csharp/builder/sdkreference/gettingstarted.html) (look for the _Registering your Bot with the Microsoft Bot Framework_ section) to register your bot with the Microsoft Bot Framework.

```
git clone https://github.com/CatalystCode/bot-trees.git
cd bot-trees
npm install
```

Create a `config/dev.private.json` base on the `config/dev.sample.json` file. Edit it and add your bot App id and password.

After connecting your bot to this endpoint, run `npm start`.

Using your preferred pre-provisioned channel, type `workout` in order to start the workout scenario.


# License
[MIT](LICENSE)


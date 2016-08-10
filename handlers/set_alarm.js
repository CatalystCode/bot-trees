
module.exports = function (session, next, data) {
  session.send('Alarm set in 2 hours for intent: ' + session.dialogData[data.source]);
  next();
}
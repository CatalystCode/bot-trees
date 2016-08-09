
module.exports = function (session, next) {
  var summary = "";
  for (var prop in session.dialogData) {
    summary += prop + ': [' + session.dialogData[prop] + ']; '; 
  }
  session.send(summary);
  next();
}